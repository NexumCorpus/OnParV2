'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { getQueueCount } from '@/lib/utils/offline-queue'

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

  // Check queue count when offline
  useEffect(() => {
    if (isOnline) return
    setQueueCount(getQueueCount())
    const interval = setInterval(() => setQueueCount(getQueueCount()), 5000)
    return () => clearInterval(interval)
  }, [isOnline])

  if (isOnline) {
    return null
  }

  return (
    <div className="bg-warning-500 text-center text-sm py-1 text-black font-medium" role="alert">
      You&apos;re offline.
      {queueCount > 0
        ? ` ${queueCount} action${queueCount !== 1 ? 's' : ''} queued — will sync when reconnected.`
        : ' Changes will sync when reconnected.'}
    </div>
  )
}
