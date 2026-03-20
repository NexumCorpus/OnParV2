// Offline mutation queue using localStorage
// Stores pending actions (waste events, inventory adjustments) that will be
// replayed when the user comes back online.

export interface QueuedAction {
  id: string
  type: 'waste_event' | 'batch_waste_events' | 'inventory_adjust'
  payload: Record<string, unknown>
  timestamp: number
}

const STORAGE_KEY = 'onpar_offline_queue'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getQueuedActions(): QueuedAction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as QueuedAction[]) : []
  } catch {
    return []
  }
}

export function enqueueAction(
  type: QueuedAction['type'],
  payload: Record<string, unknown>
): void {
  const queue = getQueuedActions()
  queue.push({
    id: generateId(),
    type,
    payload,
    timestamp: Date.now(),
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
}

export function removeAction(id: string): void {
  const queue = getQueuedActions().filter((a) => a.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
}

export function clearQueue(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getQueueCount(): number {
  return getQueuedActions().length
}
