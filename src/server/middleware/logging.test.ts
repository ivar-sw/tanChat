import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-start', () => ({
  createMiddleware: () => ({
    server: (handler: unknown) => handler,
  }),
}))

vi.mock('~/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

async function setup() {
  vi.resetModules()

  const [{ logger }, { loggingMiddleware }] = await Promise.all([
    import('~/lib/logger'),
    import('./logging'),
  ])

  const runLoggingMiddleware = (ctx: { next: (...args: unknown[]) => unknown }) => {
    return (loggingMiddleware as unknown as (context: typeof ctx) => Promise<unknown>)(ctx)
  }

  return {
    runLoggingMiddleware,
    mockLoggerWarn: vi.mocked(logger.warn),
    mockLoggerError: vi.mocked(logger.error),
  }
}

describe('loggingMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns next result when no error', async () => {
    const { runLoggingMiddleware, mockLoggerWarn, mockLoggerError } = await setup()

    const result = await runLoggingMiddleware({
      next: vi.fn(async () => 'ok'),
    })

    expect(result).toBe('ok')
    expect(mockLoggerWarn).not.toHaveBeenCalled()
    expect(mockLoggerError).not.toHaveBeenCalled()
  })

  it('logs warn and rethrows plain Error unchanged', async () => {
    const { runLoggingMiddleware, mockLoggerWarn, mockLoggerError } = await setup()
    const err = new Error('Invalid credentials')

    await expect(runLoggingMiddleware({
      next: vi.fn(async () => {
        throw err
      }),
    })).rejects.toBe(err)

    expect(mockLoggerWarn).toHaveBeenCalledWith(err, 'Request failed')
    expect(mockLoggerError).not.toHaveBeenCalled()
  })

  it('converts subclassed Error to generic message', async () => {
    const { runLoggingMiddleware, mockLoggerError } = await setup()
    class DbError extends Error {}
    const err = new DbError('UNIQUE constraint failed: channels.name')

    await expect(runLoggingMiddleware({
      next: vi.fn(async () => {
        throw err
      }),
    })).rejects.toThrow('Something went wrong')

    expect(mockLoggerError).toHaveBeenCalledWith(err, 'Server function error')
  })

  it('converts non-Error throw to generic message', async () => {
    const { runLoggingMiddleware, mockLoggerError } = await setup()
    const nonError = { reason: 'boom' }

    await expect(runLoggingMiddleware({
      next: vi.fn(() => new Promise((_, reject) => reject(nonError))),
    })).rejects.toThrow('Something went wrong')

    expect(mockLoggerError).toHaveBeenCalledWith(nonError, 'Server function error')
  })
})
