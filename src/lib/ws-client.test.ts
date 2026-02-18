import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createWsClient } from './ws-client'

let mockInstances: MockWebSocket[]

class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  url: string
  private handlers: Record<string, ((...args: any[]) => void)[]> = {}

  constructor(url: string) {
    this.url = url
    mockInstances.push(this)
  }

  addEventListener(event: string, handler: (...args: any[]) => void) {
    if (!this.handlers[event])
      this.handlers[event] = []
    this.handlers[event].push(handler)
  }

  send = vi.fn()
  close = vi.fn()

  simulateOpen() {
    this.readyState = MockWebSocket.OPEN
    this.handlers.open?.forEach(h => h())
  }

  simulateMessage(data: unknown) {
    this.handlers.message?.forEach(h => h({ data: JSON.stringify(data) }))
  }

  simulateClose() {
    this.readyState = MockWebSocket.CLOSED
    this.handlers.close?.forEach(h => h())
  }
}

beforeEach(() => {
  mockInstances = []
  vi.useFakeTimers()
  vi.stubGlobal('WebSocket', MockWebSocket)
  vi.stubGlobal('window', { location: { protocol: 'http:', hostname: 'localhost' } })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('createWsClient', () => {
  it('connect() creates WebSocket with correct URL', () => {
    const client = createWsClient()
    client.connect()

    expect(mockInstances).toHaveLength(1)
    expect(mockInstances[0].url).toBe('ws://localhost:3002')
  })

  it('send() queues messages when not connected', () => {
    const client = createWsClient()
    client.send({ type: 'typing:start' })

    // No socket created yet, message should be queued
    expect(mockInstances).toHaveLength(0)
  })

  it('send() sends directly when connected', () => {
    const client = createWsClient()
    client.connect()
    mockInstances[0].simulateOpen()

    client.send({ type: 'typing:start' })

    expect(mockInstances[0].send).toHaveBeenCalledWith(JSON.stringify({ type: 'typing:start' }))
  })

  it('send() flushes queued messages on connect', () => {
    const client = createWsClient()
    client.connect()

    // Queue messages before open
    client.send({ type: 'typing:start' })
    client.send({ type: 'typing:stop' })

    expect(mockInstances[0].send).not.toHaveBeenCalled()

    mockInstances[0].simulateOpen()

    expect(mockInstances[0].send).toHaveBeenCalledTimes(2)
    expect(mockInstances[0].send).toHaveBeenCalledWith(JSON.stringify({ type: 'typing:start' }))
    expect(mockInstances[0].send).toHaveBeenCalledWith(JSON.stringify({ type: 'typing:stop' }))
  })

  it('onMessage() registers handler and returns unsubscribe', () => {
    const client = createWsClient()
    const handler = vi.fn()

    const unsub = client.onMessage(handler)
    client.connect()
    mockInstances[0].simulateOpen()
    mockInstances[0].simulateMessage({ type: 'typing:start', userId: 1, username: 'alice' })

    expect(handler).toHaveBeenCalledWith({ type: 'typing:start', userId: 1, username: 'alice' })

    unsub()
    mockInstances[0].simulateMessage({ type: 'typing:stop', userId: 1 })

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('disconnect() cleans up', () => {
    const client = createWsClient()
    client.connect()
    mockInstances[0].simulateOpen()

    client.disconnect()

    expect(mockInstances[0].close).toHaveBeenCalled()
  })

  it('reconnects after close', () => {
    const client = createWsClient()
    client.connect()
    mockInstances[0].simulateOpen()
    mockInstances[0].simulateClose()

    expect(mockInstances).toHaveLength(1)

    vi.advanceTimersByTime(2000)

    expect(mockInstances).toHaveLength(2)
  })

  it('does not reconnect after manual disconnect', () => {
    const client = createWsClient()
    client.connect()
    mockInstances[0].simulateOpen()

    client.disconnect()
    mockInstances[0].simulateClose()
    vi.advanceTimersByTime(2000)

    expect(mockInstances).toHaveLength(1)
  })
})
