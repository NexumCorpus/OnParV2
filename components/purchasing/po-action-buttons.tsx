'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendPurchaseOrder, receivePurchaseOrder } from '@/lib/actions/purchasing'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Send, CheckCircle, Printer } from 'lucide-react'

interface PoActionButtonsProps {
  poId: string
  status: string
}

export function PoActionButtons({ poId, status }: PoActionButtonsProps) {
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)
  const [isReceiving, setIsReceiving] = useState(false)

  const handleSend = async () => {
    setIsSending(true)
    const result = await sendPurchaseOrder(poId)
    setIsSending(false)

    if (result.success) {
      toast.success('Purchase order marked as sent!')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to send PO.')
    }
  }

  const handleReceive = async () => {
    setIsReceiving(true)
    const result = await receivePurchaseOrder(poId)
    setIsReceiving(false)

    if (result.success) {
      toast.success('Purchase order marked as received and inventory updated!')
      router.refresh()
    } else {
      toast.error(result.error || 'Failed to receive PO.')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="h-4 w-4 mr-2" />
        Print PDF
      </Button>

      {status === 'draft' && (
        <Button onClick={handleSend} disabled={isSending}>
          <Send className="h-4 w-4 mr-2" />
          {isSending ? 'Sending...' : 'Mark as Sent'}
        </Button>
      )}

      {(status === 'sent' || status === 'partially_received') && (
        <Button onClick={handleReceive} disabled={isReceiving}>
          <CheckCircle className="h-4 w-4 mr-2" />
          {isReceiving ? 'Receiving...' : 'Receive Items'}
        </Button>
      )}
    </div>
  )
}
