import type { JwtPayload } from '../auth'
import { createMiddleware } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { COOKIE_NAME, verifyToken } from '../auth'

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const token = getCookie(COOKIE_NAME)
  const user = token ? verifyToken(token) : null

  if (!user) {
    throw new Error('Unauthorized')
  }

  return next({ context: { user } })
})

declare module '@tanstack/react-start' {
  interface MiddlewareContext {
    user: JwtPayload
  }
}
