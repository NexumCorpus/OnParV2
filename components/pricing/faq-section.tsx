'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    question: 'Can I change plans anytime?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you will be prorated for the remaining time on your current billing cycle. When downgrading, the change takes effect at the end of your current billing period.',
  },
  {
    question: 'What happens after my trial ends?',
    answer:
      'After your 14-day free trial ends, you will be automatically charged for the plan you selected. You can cancel anytime during the trial to avoid being charged. If you cancel, you will still have access until the trial period ends.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'We offer a full refund within 30 days of your first payment if you are not satisfied. After that, you can cancel your subscription at any time and continue to use the service until the end of your current billing period.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. All data is encrypted in transit and at rest. We use Supabase for our database infrastructure, which provides enterprise-grade security. Payments are processed securely through Stripe, and we never store your credit card information on our servers.',
  },
] as const

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-8 text-center text-2xl font-bold">
        Frequently Asked Questions
      </h2>
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-lg border">
            <button
              type="button"
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
              className="flex w-full items-center justify-between p-4 text-left text-sm font-medium hover:bg-accent/50 transition-colors"
            >
              {faq.question}
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 transition-transform',
                  openIndex === index && 'rotate-180'
                )}
              />
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 text-sm text-muted-foreground">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
