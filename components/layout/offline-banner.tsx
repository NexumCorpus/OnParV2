'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { getQueueCount, getQueuedActions, removeAction } from '@/lib/utils/offline-queue'
import { recordWasteEvent, recordBatchWasteEvents } from '@/lib/actions/waste'
import { toast } from 'sonner'
import type { RecordWasteInput } from '@/types'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true
}

export function OfflineBanner() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [queueCount, setQueueCount] = useState(0)
  const [syncing, setSyncing] = useState(false)

  // Poll queue count every 2 seconds when offline
  useEffect(() => {
    const update = () => setQueueCount(getQueueCount())
    update()
    const interval = setInterval(update, 2000)
    return () => clearInterval(interval)
  }, [])

  const processQueue = useCallback(async () => {
    const actions = getQueuedActions()
    if (actions.length === 0) return

    setSyncing(true)
    let synced = 0

    for (const action of actions) {
      try {
        let result: { success: boolean }
        if (action.type === 'waste_event') {
          result = await recordWasteEvent(action.payload as RecordWasteInput)
        } else if (action.type === 'batch_waste_events') {
          result = await recordBatchWasteEvents(
            action.payload.events as RecordWasteInput[]
          )
        } else {
          // Unknown type — remove from queue
          removeAction(action.id)
          continue
        }

        if (result.success) {
          removeAction(action.id)
          synced++
        }
      } catch {
        // Leave in queue for next attempt
      }
    }

    setSyncing(false)
    setQueueCount(getQueueCount())

    if (synced > 0) {
      toast.success(`Synced ${synced} queued action${synced !== 1 ? 's' : ''}`)
    }
  }, [])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && queueCount > 0) {
      void processQueue()
    }
  }, [isOnline, queueCount, processQueue])

  if (isOnline && !syncing) {
    return null
  }

  return (
    <div className="bg-warning-500 text-center text-sm py-1 text-black font-medium" role="alert">
      {syncing
        ? 'Syncing queued actions...'
        : `You're offline.${queueCount > 0 ? ` ${queueCount} action${queueCount !== 1 ? 's' : ''} queued.` : ' Changes will sync when reconnected.'}`}
    </div>
  )
}
