import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800 dark:text-green-200">
            Payment Successful!
          </CardTitle>
          <CardDescription>
            Thank you for subscribing to OnPar. Your account has been activated.
          </CardDescription>
          {sessionId && (
            <div className="text-xs text-muted-foreground mt-2">
              Session ID: {sessionId.substring(0, 20)}...
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              What's Next?
            </h3>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 text-left">
              <li>• Access your dashboard to start managing inventory</li>
              <li>• Set up your restaurant profile and preferences</li>
              <li>• Import your existing inventory data</li>
              <li>• Configure alerts and notifications</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Link href="/dashboard">
              <Button className="w-full" size="lg">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            
            <Link href="/profile">
              <Button variant="outline" className="w-full">
                Set Up Profile
              </Button>
            </Link>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>
              Need help getting started? Contact our support team at{' '}
              <a href="mailto:support@onpar.app" className="text-primary hover:underline">
                support@onpar.app
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}