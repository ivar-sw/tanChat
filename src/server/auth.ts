import { setCookie } from '@tanstack/react-start/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret)
    throw new Error('JWT_SECRET environment variable is required')
  return secret
}

export const COOKIE_NAME = 'auth_token'

export interface JwtPayload {
  userId: number
  username: string
}

export const hashPassword = (password: string): string => {
  return bcrypt.hashSync(password, 10)
}

export const verifyPassword = (password: string, hash: string): boolean => {
  return bcrypt.compareSync(password, hash)
}

const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload
  }
  catch {
    return null
  }
}

const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  }
}

export const setAuthCookie = (userId: number, username: string) => {
  const token = signToken({ userId, username })
  const opts = getCookieOptions()
  setCookie(COOKIE_NAME, token, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    maxAge: opts.maxAge,
    path: opts.path,
  })
}
