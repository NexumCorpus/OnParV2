// Utility functions for browser-only operations
export const isBrowser = typeof window !== 'undefined'

export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  if (!isBrowser) return
  
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function getCurrentUrl(): string {
  if (!isBrowser) return ''
  return window.location.href
}

export function redirectTo(url: string) {
  if (!isBrowser) return
  window.location.href = url
}

export function reloadPage() {
  if (!isBrowser) return
  window.location.reload()
}

export function openInNewTab(url: string) {
  if (!isBrowser) return
  window.open(url, '_blank')
}

export function addKeyboardListener(callback: (event: KeyboardEvent) => void) {
  if (!isBrowser) return () => {}
  
  document.addEventListener('keydown', callback)
  return () => document.removeEventListener('keydown', callback)
}

export function setDocumentStyle(property: string, value: string) {
  if (!isBrowser) return
  document.documentElement.style.setProperty(property, value)
}

export function toggleDocumentClass(className: string, force?: boolean) {
  if (!isBrowser) return
  document.documentElement.classList.toggle(className, force)
}