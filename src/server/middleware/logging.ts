import { createMiddleware } from '@tanstack/react-start'
import { logger } from '~/lib/logger'

export const loggingMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next()
  }
  catch (err) {
    if (err instanceof Error && err.constructor === Error) {
      logger.warn(err, 'Request failed')
      throw err
    }

    logger.error(err, 'Server function error')
    throw new Error('Something went wrong')
  }
})
