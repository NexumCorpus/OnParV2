'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<ForgotPasswordValues>({
    mode: 'onBlur',
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: ForgotPasswordValues) {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/login`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setEmailSent(true)
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">{APP_NAME}</CardTitle>
        <CardDescription>
          {emailSent
            ? 'Check your email for a reset link.'
            : 'Enter your email to reset your password.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emailSent ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
              <Mail className="h-6 w-6 text-brand-600" aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              If an account exists with that email, you&apos;ll receive a password reset link shortly.
            </p>
            <Link href="/login">
              <Button variant="outline" className="min-h-[44px]">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@restaurant.com"
                          autoComplete="email"
                          className="text-base"
                          aria-required="true"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full min-h-[44px] bg-brand-600 hover:bg-brand-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </Form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              <Link
                href="/login"
                className="font-medium text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline"
              >
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
