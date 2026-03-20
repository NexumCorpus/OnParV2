import Stripe from 'stripe'
import { stripe } from '@/lib/services/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/utils/logger'

/** Extract current_period_start/end from the first subscription item */
function getSubscriptionPeriod(subscription: Stripe.Subscription): {
  periodStart: string
  periodEnd: string
} {
  const firstItem = subscription.items.data[0]
  if (firstItem) {
    return {
      periodStart: new Date(firstItem.current_period_start * 1000).toISOString(),
      periodEnd: new Date(firstItem.current_period_end * 1000).toISOString(),
    }
  }
  // Fallback to billing_cycle_anchor and start_date
  return {
    periodStart: new Date(subscription.start_date * 1000).toISOString(),
    periodEnd: new Date(subscription.billing_cycle_anchor * 1000).toISOString(),
  }
}

/** Extract subscription ID from an invoice's parent field */
function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  if (
    invoice.parent?.type === 'subscription_details' &&
    invoice.parent.subscription_details
  ) {
    const sub = invoice.parent.subscription_details.subscription
    return typeof sub === 'string' ? sub : sub.id
  }
  return null
}

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !webhookSecret) {
    return new Response('Stripe is not configured', { status: 200 })
  }

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      webhookSecret
    )
  } catch (err) {
    logger.error({ err }, 'Webhook signature verification failed')
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const customerId = session.customer as string | null
        const subscriptionId = session.subscription as string | null

        if (!userId || !customerId) {
          logger.warn({ session: session.id }, 'Missing userId or customerId in checkout session')
          break
        }

        // Ensure stripe_customers record exists
        const { data: existingCustomer } = await supabase
          .from('stripe_customers')
          .select('id')
          .eq('user_id', userId)
          .single()

        if (!existingCustomer) {
          await supabase.from('stripe_customers').insert({
            user_id: userId,
            stripe_customer_id: customerId,
          })
        }

        // Create subscription record if subscription exists
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = subscription.items.data[0]?.price?.id ?? ''
          const { periodStart, periodEnd } = getSubscriptionPeriod(subscription)

          await supabase.from('stripe_subscriptions').upsert(
            {
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: customerId,
              stripe_price_id: priceId,
              status: subscription.status,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              cancel_at_period_end: subscription.cancel_at_period_end,
            },
            { onConflict: 'stripe_subscription_id' }
          )
        }

        logger.info({ userId, customerId, subscriptionId }, 'Checkout session completed')
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price?.id ?? ''
        const { periodStart, periodEnd } = getSubscriptionPeriod(subscription)

        await supabase
          .from('stripe_subscriptions')
          .upsert(
            {
              stripe_subscription_id: subscription.id,
              stripe_customer_id: customerId,
              stripe_price_id: priceId,
              status: subscription.status,
              current_period_start: periodStart,
              current_period_end: periodEnd,
              cancel_at_period_end: subscription.cancel_at_period_end,
            },
            { onConflict: 'stripe_subscription_id' }
          )

        logger.info(
          { subscriptionId: subscription.id, status: subscription.status },
          'Subscription updated'
        )
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from('stripe_subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        logger.info({ subscriptionId: subscription.id }, 'Subscription canceled')
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        logger.info(
          {
            invoiceId: invoice.id,
            customerId: invoice.customer as string,
            amountPaid: invoice.amount_paid,
          },
          'Invoice payment succeeded'
        )
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = getInvoiceSubscriptionId(invoice)

        if (subscriptionId) {
          await supabase
            .from('stripe_subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId)
        }

        logger.warn(
          {
            invoiceId: invoice.id,
            customerId: invoice.customer as string,
          },
          'Invoice payment failed'
        )
        break
      }

      default:
        logger.info({ type: event.type }, 'Unhandled webhook event type')
    }
  } catch (err) {
    logger.error({ err, eventType: event.type }, 'Error processing webhook event')
    return new Response('Webhook handler error', { status: 500 })
  }

  return new Response('OK', { status: 200 })
}
