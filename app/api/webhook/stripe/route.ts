import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'
import { logError, logUserAction } from '@/lib/error-logging'

const stripe = new Stripe((typeof process !== 'undefined' ? process.env.STRIPE_SECRET_KEY : undefined) || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
})

const webhookSecret = (typeof process !== 'undefined' ? process.env.STRIPE_WEBHOOK_SECRET : undefined) || 'whsec_placeholder'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      logError(err as Error, 'stripe_webhook_signature_verification')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logError(error as Error, 'stripe_webhook_handler')
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    
    // Get customer details
    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
    
    if (!customer.email) {
      throw new Error('Customer email not found')
    }

    // Find user by email
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', customer.email)
      .single()

    if (!user) {
      throw new Error(`User not found for email: ${customer.email}`)
    }

    // Determine subscription type
    const isPremium = subscription.items.data.some(item => 
      item.price.lookup_key === 'premium_addon'
    )

    // Update user subscription status
    const { error } = await supabase
      .from('users')
      .update({
        premium_subscription: isPremium,
        stripe_customer_id: customerId,
        subscription_status: subscription.status
      })
      .eq('id', user.id)

    if (error) {
      throw error
    }

    logUserAction('subscription_created', {
      subscription_id: subscription.id,
      is_premium: isPremium,
      status: subscription.status
    }, user.id)

  } catch (error) {
    logError(error as Error, 'handle_subscription_created')
    throw error
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    
    // Find user by Stripe customer ID
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!user) {
      throw new Error(`User not found for customer ID: ${customerId}`)
    }

    // Determine subscription type
    const isPremium = subscription.items.data.some(item => 
      item.price.lookup_key === 'premium_addon'
    )

    // Update user subscription status
    const { error } = await supabase
      .from('users')
      .update({
        premium_subscription: isPremium,
        subscription_status: subscription.status
      })
      .eq('id', user.id)

    if (error) {
      throw error
    }

    logUserAction('subscription_updated', {
      subscription_id: subscription.id,
      is_premium: isPremium,
      status: subscription.status
    }, user.id)

  } catch (error) {
    logError(error as Error, 'handle_subscription_updated')
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    
    // Find user by Stripe customer ID
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!user) {
      throw new Error(`User not found for customer ID: ${customerId}`)
    }

    // Update user subscription status
    const { error } = await supabase
      .from('users')
      .update({
        premium_subscription: false,
        subscription_status: 'cancelled'
      })
      .eq('id', user.id)

    if (error) {
      throw error
    }

    logUserAction('subscription_cancelled', {
      subscription_id: subscription.id
    }, user.id)

  } catch (error) {
    logError(error as Error, 'handle_subscription_deleted')
    throw error
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    
    // Find user by Stripe customer ID
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single()

    if (user) {
      logUserAction('payment_succeeded', {
        invoice_id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency
      }, user.id)
    }

  } catch (error) {
    logError(error as Error, 'handle_payment_succeeded')
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string
    
    // Find user by Stripe customer ID
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single()

    if (user) {
      logUserAction('payment_failed', {
        invoice_id: invoice.id,
        amount: invoice.amount_due,
        currency: invoice.currency
      }, user.id)
    }

  } catch (error) {
    logError(error as Error, 'handle_payment_failed')
  }
}