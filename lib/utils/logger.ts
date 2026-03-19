import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
})

// Usage examples:
// logger.info({ userId, action: 'createItem' }, 'Inventory item created')
// logger.error({ err, userId }, 'Failed to create item')
// logger.warn({ itemId, quantity }, 'Low stock detected')
