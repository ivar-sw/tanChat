import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-start', () => ({
  createMiddleware: () => ({
    server: (handler: unknown) => handler,
  }),
}))

vi.mock('@tanstack/react-start/server', () => ({
  getCookie: vi.fn(),
}))

vi.mock('../auth', () => ({
  COOKIE_NAME: 'auth_token',
  verifyToken: vi.fn(),
}))

async function setup() {
  vi.resetModules()

  const [{ getCookie }, { verifyToken }, { authMiddleware }] = await Promise.all([
    import('@tanstack/react-start/server'),
    import('../auth'),
    import('./auth'),
  ])

  const runAuthMiddleware = (ctx: { next: (...args: unknown[]) => unknown }) => {
    return (authMiddleware as unknown as (context: typeof ctx) => Promise<unknown>)(ctx)
  }

  return {
    runAuthMiddleware,
    mockGetCookie: vi.mocked(getCookie),
    mockVerifyToken: vi.mocked(verifyToken),
  }
}

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws Unauthorized when token is missing', async () => {
    const { runAuthMiddleware, mockGetCookie, mockVerifyToken } = await setup()
    mockGetCookie.mockReturnValue(undefined)

    await expect(runAuthMiddleware({
      next: vi.fn(),
    })).rejects.toThrow('Unauthorized')

    expect(mockVerifyToken).not.toHaveBeenCalled()
  })

  it('throws Unauthorized when token is invalid', async () => {
    const { runAuthMiddleware, mockGetCookie, mockVerifyToken } = await setup()
    mockGetCookie.mockReturnValue('bad-token')
    mockVerifyToken.mockReturnValue(null)

    await expect(runAuthMiddleware({
      next: vi.fn(),
    })).rejects.toThrow('Unauthorized')
  })

  it('passes user context to next when token is valid', async () => {
    const { runAuthMiddleware, mockGetCookie, mockVerifyToken } = await setup()
    const user = { userId: 7, username: 'alice' }
    const next = vi.fn(async () => 'done')
    mockGetCookie.mockReturnValue('good-token')
    mockVerifyToken.mockReturnValue(user)

    const result = await runAuthMiddleware({ next })

    expect(result).toBe('done')
    expect(next).toHaveBeenCalledWith({ context: { user } })
  })
})
