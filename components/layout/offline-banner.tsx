'use client'

import { useSyncExternalStore } from 'react'

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

  if (isOnline) {
    return null
  }

  return (
    <div className="bg-warning-500 text-center text-sm py-1 text-black font-medium" role="alert">
      You&apos;re offline. Changes will sync when reconnected.
    </div>
  )
}
