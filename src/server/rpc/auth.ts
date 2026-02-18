import { createServerFn } from '@tanstack/react-start'
import { deleteCookie, getCookie } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { authInputSchema, friendlyParse } from '~/lib/validation'
import {
  COOKIE_NAME,
  hashPassword,
  setAuthCookie,
  verifyPassword,
  verifyToken,
} from '~/server/auth'
import { db } from '~/server/db'
import { users } from '~/server/db/schema'
import { loggingMiddleware } from '~/server/middleware'

export const register = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware])
  .inputValidator(data => friendlyParse(authInputSchema, data))
  .handler(async ({ data }) => {
    const user = await db
      .insert(users)
      .values({
        username: data.username,
        passwordHash: hashPassword(data.password),
      })
      .onConflictDoNothing()
      .returning()
      .get()

    if (!user) {
      throw new Error('Username already taken')
    }

    setAuthCookie(user.id, user.username)

    return { userId: user.id, username: user.username }
  })

export const login = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware])
  .inputValidator(data => friendlyParse(authInputSchema, data))
  .handler(async ({ data }) => {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, data.username))
      .get()

    if (!user || !verifyPassword(data.password, user.passwordHash)) {
      throw new Error('Invalid credentials')
    }

    setAuthCookie(user.id, user.username)

    return { userId: user.id, username: user.username }
  })

export const logout = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware])
  .handler(async () => {
    deleteCookie(COOKIE_NAME)
    return { ok: true }
  })

export const getSession = createServerFn({ method: 'GET' })
  .middleware([loggingMiddleware])
  .handler(async () => {
    const token = getCookie(COOKIE_NAME)
    if (!token)
      return null
    return verifyToken(token)
  },
  )
