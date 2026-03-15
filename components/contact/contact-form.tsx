'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { submitFeedback } from '@/lib/actions/feedback'

const SUBJECTS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
] as const

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    const result = await submitFeedback(formData)

    if (result.success) {
      toast.success('Message sent! We\'ll get back to you within 24 hours.')
      setSubmitted(true)
      form.reset()
    } else {
      toast.error(result.error || 'Failed to send message. Please try again.')
    }

    setIsSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
          <span className="text-2xl" role="img" aria-label="Check mark">
            &#10003;
          </span>
        </div>
        <h3 className="mt-4 text-lg font-semibold">Message sent!</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
        <Button
          variant="outline"
          className="mt-6 min-h-[44px]"
          onClick={() => setSubmitted(false)}
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border bg-card p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-xl font-semibold">Get in Touch</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Fill out the form below and we&apos;ll respond within 24 hours.
      </p>

      <div className="mt-6 space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="contact-name">
            Name <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="contact-name"
            name="name"
            type="text"
            required
            aria-required="true"
            placeholder="Your name"
            className="mt-1.5 text-base"
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="contact-email">
            Email <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            aria-required="true"
            placeholder="you@restaurant.com"
            className="mt-1.5 text-base"
          />
        </div>

        {/* Subject */}
        <div>
          <Label htmlFor="contact-subject">
            Subject <span aria-hidden="true">*</span>
          </Label>
          <Select name="subject" defaultValue="general" required>
            <SelectTrigger
              id="contact-subject"
              className="mt-1.5 min-h-[44px] text-base"
              aria-required="true"
            >
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Message */}
        <div>
          <Label htmlFor="contact-message">
            Message <span aria-hidden="true">*</span>
          </Label>
          <textarea
            id="contact-message"
            name="message"
            required
            aria-required="true"
            rows={5}
            placeholder="How can we help you?"
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white min-h-[44px] text-base"
        >
          {isSubmitting ? (
            <>
              <Loader2
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </Button>
      </div>
    </form>
  )
}
