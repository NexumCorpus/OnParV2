import type { Metadata } from 'next'
import { Mail, Clock } from 'lucide-react'
import { ContactForm } from '@/components/contact/contact-form'

export const metadata: Metadata = {
  title: 'Contact - OnPar',
  description:
    'Get in touch with the OnPar team. We respond to all inquiries within one business day.',
}

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'kaleb@onparkitchen.com',
  },
  {
    icon: Clock,
    label: 'Response time',
    value: 'Within 1 business day',
  },
] as const

export default function ContactPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question or feedback? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Content grid */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-[1fr_320px]">
          {/* Contact form */}
          <ContactForm />

          {/* Sidebar */}
          <aside className="space-y-6" aria-label="Contact information">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Contact Info</h2>
              <div className="mt-4 space-y-4">
                {CONTACT_INFO.map((info) => (
                  <div key={info.label} className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
                      <info.icon
                        className="size-4 text-brand-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{info.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {info.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Response Time</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We respond to all inquiries within 24 hours during business
                days. For urgent matters, please include &quot;URGENT&quot; in
                your subject.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
