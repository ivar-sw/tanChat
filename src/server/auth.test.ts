import { setCookie } from '@tanstack/react-start/server'

import { describe, expect, it, vi } from 'vitest'
import {
  COOKIE_NAME,
  hashPassword,
  setAuthCookie,
  verifyPassword,
  verifyToken,
} from './auth'

// Mock @tanstack/react-start/server before importing auth
vi.mock('@tanstack/react-start/server', () => ({
  setCookie: vi.fn(),
}))

// Set JWT_SECRET before importing auth module
process.env.JWT_SECRET = 'test-secret-key-for-testing'

describe('auth', () => {
  describe('hashPassword / verifyPassword', () => {
    it('hashes a password and verifies it', () => {
      const hash = hashPassword('mypassword')
      expect(hash).not.toBe('mypassword')
      expect(verifyPassword('mypassword', hash)).toBe(true)
    })

    it('rejects an incorrect password', () => {
      const hash = hashPassword('correct')
      expect(verifyPassword('wrong', hash)).toBe(false)
    })
  })

  describe('verifyToken', () => {
    it('returns null for an invalid token', () => {
      expect(verifyToken('garbage-token')).toBeNull()
    })

    it('returns null for an empty token', () => {
      expect(verifyToken('')).toBeNull()
    })
  })

  describe('setAuthCookie', () => {
    it('calls setCookie with a signed token', () => {
      const mockSetCookie = vi.mocked(setCookie)
      mockSetCookie.mockClear()

      setAuthCookie(1, 'alice')

      expect(mockSetCookie).toHaveBeenCalledOnce()
      expect(mockSetCookie).toHaveBeenCalledWith(
        COOKIE_NAME,
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        }),
      )

      // Verify the token in the call is valid
      const token = mockSetCookie.mock.calls[0][1]
      const decoded = verifyToken(token)
      expect(decoded).not.toBeNull()
      expect(decoded!.userId).toBe(1)
      expect(decoded!.username).toBe('alice')
    })

    it('sets secure flag in production', () => {
      const mockSetCookie = vi.mocked(setCookie)
      mockSetCookie.mockClear()

      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      setAuthCookie(1, 'alice')

      expect(mockSetCookie).toHaveBeenCalledWith(
        COOKIE_NAME,
        expect.any(String),
        expect.objectContaining({ secure: true }),
      )

      process.env.NODE_ENV = originalEnv
    })
  })
})
