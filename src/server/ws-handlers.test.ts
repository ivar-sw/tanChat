import type { WebSocketServer } from 'ws'
import type { AuthedSocket } from './ws-handlers'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WebSocket } from 'ws'
import {
  broadcast,
  broadcastAll,
  getChannelCounts,
  getOnlineUsers,
  handleChannelCreated,
  handleChannelJoin,
  handleNewMessage,
  handleTypingStart,
  handleTypingStop,
  isAuthedSocket,
} from './ws-handlers'
import { loadMessageForBroadcast } from './ws-message-helpers'

vi.mock('./ws-message-helpers', () => ({
  loadMessageForBroadcast: vi.fn(),
}))

const mockLoadMessageForBroadcast = vi.mocked(loadMessageForBroadcast)
const defaultUser = { userId: 99, username: 'mock' }

const createMockSocket = (overrides: Partial<AuthedSocket> = {}): AuthedSocket => {
  return {
    readyState: WebSocket.OPEN,
    send: vi.fn(),
    channelId: undefined,
    user: defaultUser,
    ...overrides,
  } as unknown as AuthedSocket
}

const createMockWss = (clients: AuthedSocket[]): WebSocketServer => {
  return {
    clients: new Set(clients),
  } as unknown as WebSocketServer
}

describe('ws-handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('broadcast', () => {
    it('sends data to clients in the same channel', () => {
      const client1 = createMockSocket({ channelId: 1 })
      const client2 = createMockSocket({ channelId: 1 })
      const client3 = createMockSocket({ channelId: 2 })
      const wss = createMockWss([client1, client2, client3])

      broadcast(wss, 1, { type: 'user:joined', username: 'alice' })

      expect(client1.send).toHaveBeenCalledOnce()
      expect(client2.send).toHaveBeenCalledOnce()
      expect(client3.send).not.toHaveBeenCalled()
    })

    it('excludes specified client', () => {
      const client1 = createMockSocket({ channelId: 1 })
      const client2 = createMockSocket({ channelId: 1 })
      const wss = createMockWss([client1, client2])

      broadcast(wss, 1, { type: 'user:joined', username: 'alice' }, client1)

      expect(client1.send).not.toHaveBeenCalled()
      expect(client2.send).toHaveBeenCalledOnce()
    })

    it('skips clients that are not OPEN', () => {
      const client1 = createMockSocket({ channelId: 1, readyState: WebSocket.CLOSED })
      const client2 = createMockSocket({ channelId: 1 })
      const wss = createMockWss([client1, client2])

      broadcast(wss, 1, { type: 'user:joined', username: 'alice' })

      expect(client1.send).not.toHaveBeenCalled()
      expect(client2.send).toHaveBeenCalledOnce()
    })

    it('sends the correct JSON payload', () => {
      const client = createMockSocket({ channelId: 1 })
      const wss = createMockWss([client])
      const data = { type: 'user:joined' as const, username: 'bob' }

      broadcast(wss, 1, data)

      expect(client.send).toHaveBeenCalledWith(JSON.stringify(data))
    })
  })

  describe('broadcastAll', () => {
    it('sends data to all open clients', () => {
      const client1 = createMockSocket({ channelId: 1 })
      const client2 = createMockSocket({ channelId: 2 })
      const closedClient = createMockSocket({ channelId: 1, readyState: WebSocket.CLOSED })
      const wss = createMockWss([client1, client2, closedClient])

      broadcastAll(wss, { type: 'channel:counts', counts: {} })

      expect(client1.send).toHaveBeenCalledOnce()
      expect(client2.send).toHaveBeenCalledOnce()
      expect(closedClient.send).not.toHaveBeenCalled()
    })
  })

  describe('getOnlineUsers', () => {
    it('returns users in a specific channel', () => {
      const client1 = createMockSocket({
        channelId: 1,
        user: { userId: 1, username: 'alice' },
      })
      const client2 = createMockSocket({
        channelId: 1,
        user: { userId: 2, username: 'bob' },
      })
      const client3 = createMockSocket({
        channelId: 2,
        user: { userId: 3, username: 'charlie' },
      })
      const wss = createMockWss([client1, client2, client3])

      const users = getOnlineUsers(wss, 1)
      expect(users).toEqual([
        { userId: 1, username: 'alice' },
        { userId: 2, username: 'bob' },
      ])
    })

    it('deduplicates users with multiple connections', () => {
      const client1 = createMockSocket({
        channelId: 1,
        user: { userId: 1, username: 'alice' },
      })
      const client2 = createMockSocket({
        channelId: 1,
        user: { userId: 1, username: 'alice' },
      })
      const wss = createMockWss([client1, client2])

      const users = getOnlineUsers(wss, 1)
      expect(users).toHaveLength(1)
    })

    it('returns empty array for empty channel', () => {
      const wss = createMockWss([])
      expect(getOnlineUsers(wss, 1)).toEqual([])
    })
  })

  describe('getChannelCounts', () => {
    it('returns unique user count per channel', () => {
      const client1 = createMockSocket({ channelId: 1, user: { userId: 1, username: 'alice' } })
      const client2 = createMockSocket({ channelId: 1, user: { userId: 1, username: 'alice' } })
      const client3 = createMockSocket({ channelId: 2, user: { userId: 2, username: 'bob' } })
      const wss = createMockWss([client1, client2, client3])

      expect(getChannelCounts(wss)).toEqual({ 1: 1, 2: 1 })
    })

    it('skips clients without channelId', () => {
      const client1 = createMockSocket({ channelId: 1, user: { userId: 1, username: 'alice' } })
      const client2 = createMockSocket({ user: { userId: 2, username: 'bob' } })
      const wss = createMockWss([client1, client2])

      expect(getChannelCounts(wss)).toEqual({ 1: 1 })
    })

    it('skips clients without user', () => {
      const client1 = createMockSocket({ channelId: 1, user: undefined })
      const client2 = createMockSocket({ channelId: 1, user: { userId: 2, username: 'bob' } })
      const wss = createMockWss([client1, client2])

      expect(getChannelCounts(wss)).toEqual({ 1: 1 })
    })
  })

  describe('handleChannelJoin', () => {
    it('sets channelId on the socket and broadcasts presence', () => {
      const ws = createMockSocket({ user: { userId: 1, username: 'alice' } })
      const otherClient = createMockSocket({ channelId: 5 })
      const wss = createMockWss([ws, otherClient])
      const user = { userId: 1, username: 'alice' }

      handleChannelJoin(wss, ws, { type: 'channel:join', channelId: 5 }, user)

      expect(ws.channelId).toBe(5)
      expect(otherClient.send).toHaveBeenCalled()
    })

    it('notifies old channel when switching', () => {
      const oldChannelClient = createMockSocket({ channelId: 1, user: { userId: 2, username: 'bob' } })
      const ws = createMockSocket({ channelId: 1, user: { userId: 1, username: 'alice' } })
      const wss = createMockWss([ws, oldChannelClient])
      const user = { userId: 1, username: 'alice' }

      handleChannelJoin(wss, ws, { type: 'channel:join', channelId: 2 }, user)

      expect(ws.channelId).toBe(2)
      expect(oldChannelClient.send).toHaveBeenCalled()

      const payloads = (oldChannelClient.send as ReturnType<typeof vi.fn>).mock.calls.map(call => JSON.parse(call[0]))
      expect(payloads).toContainEqual({ type: 'user:left', username: 'alice' })
    })
  })

  describe('handleNewMessage', () => {
    it('broadcasts server-fetched message for valid sender/channel', async () => {
      const sender = createMockSocket({ channelId: 1 })
      const client = createMockSocket({ channelId: 1 })
      const wss = createMockWss([sender, client])
      const user = { userId: 1, username: 'alice' }
      const createdAt = new Date()
      mockLoadMessageForBroadcast.mockResolvedValue({
        id: 1,
        content: 'hi',
        createdAt,
        userId: 1,
        username: 'alice',
        channelId: 1,
      })

      await handleNewMessage(wss, sender, { type: 'message:new', channelId: 1, messageId: 1 }, user)

      expect(client.send).toHaveBeenCalledOnce()
      const sent = JSON.parse((client.send as ReturnType<typeof vi.fn>).mock.calls[0][0])
      expect(sent.type).toBe('message:new')
      expect(sent.message.content).toBe('hi')
      expect(sent.message.userId).toBe(1)
      expect(sent.message.username).toBe('alice')
      expect(sent.message.id).toBe(1)
      expect(mockLoadMessageForBroadcast).toHaveBeenCalledWith(1)
    })

    it('returns without broadcast when helper returns null', async () => {
      const sender = createMockSocket({ channelId: 1 })
      const client = createMockSocket({ channelId: 1 })
      const wss = createMockWss([sender, client])
      const user = { userId: 1, username: 'alice' }
      mockLoadMessageForBroadcast.mockResolvedValue(null)

      await handleNewMessage(wss, sender, { type: 'message:new', channelId: 1, messageId: 10 }, user)

      expect(client.send).not.toHaveBeenCalled()
    })

    it('returns without broadcast when user mismatch', async () => {
      const sender = createMockSocket({ channelId: 1 })
      const client = createMockSocket({ channelId: 1 })
      const wss = createMockWss([sender, client])
      const user = { userId: 1, username: 'alice' }
      mockLoadMessageForBroadcast.mockResolvedValue({
        id: 10,
        content: 'hi',
        createdAt: new Date(),
        userId: 2,
        username: 'bob',
        channelId: 1,
      })

      await handleNewMessage(wss, sender, { type: 'message:new', channelId: 1, messageId: 10 }, user)

      expect(client.send).not.toHaveBeenCalled()
    })

    it('returns without broadcast when channel mismatch from loaded message', async () => {
      const sender = createMockSocket({ channelId: 1 })
      const client = createMockSocket({ channelId: 1 })
      const wss = createMockWss([sender, client])
      const user = { userId: 1, username: 'alice' }
      mockLoadMessageForBroadcast.mockResolvedValue({
        id: 10,
        content: 'hi',
        createdAt: new Date(),
        userId: 1,
        username: 'alice',
        channelId: 2,
      })

      await handleNewMessage(wss, sender, { type: 'message:new', channelId: 1, messageId: 10 }, user)

      expect(client.send).not.toHaveBeenCalled()
    })

    it('returns without broadcast when ws.channelId mismatch', async () => {
      const sender = createMockSocket({ channelId: 2 })
      const client = createMockSocket({ channelId: 1 })
      const wss = createMockWss([sender, client])
      const user = { userId: 1, username: 'alice' }

      await handleNewMessage(wss, sender, { type: 'message:new', channelId: 1, messageId: 10 }, user)

      expect(mockLoadMessageForBroadcast).not.toHaveBeenCalled()
      expect(client.send).not.toHaveBeenCalled()
    })
  })

  describe('handleTypingStart', () => {
    it('broadcasts typing start to channel excluding sender', () => {
      const sender = createMockSocket({ channelId: 1 })
      const other = createMockSocket({ channelId: 1 })
      const wss = createMockWss([sender, other])

      handleTypingStart(wss, sender, { userId: 1, username: 'alice' })

      expect(sender.send).not.toHaveBeenCalled()
      expect(other.send).toHaveBeenCalledOnce()
    })

    it('does nothing when channelId is undefined', () => {
      const sender = createMockSocket()
      const other = createMockSocket({ channelId: 1 })
      const wss = createMockWss([sender, other])

      handleTypingStart(wss, sender, { userId: 1, username: 'alice' })

      expect(other.send).not.toHaveBeenCalled()
    })
  })

  describe('handleTypingStop', () => {
    it('broadcasts typing stop to channel excluding sender', () => {
      const sender = createMockSocket({ channelId: 1 })
      const other = createMockSocket({ channelId: 1 })
      const wss = createMockWss([sender, other])

      handleTypingStop(wss, sender, { userId: 1, username: 'alice' })

      expect(sender.send).not.toHaveBeenCalled()
      expect(other.send).toHaveBeenCalledOnce()
    })

    it('does nothing when channelId is undefined', () => {
      const sender = createMockSocket()
      const other = createMockSocket({ channelId: 1 })
      const wss = createMockWss([sender, other])

      handleTypingStop(wss, sender, { userId: 1, username: 'alice' })

      expect(other.send).not.toHaveBeenCalled()
    })
  })

  describe('handleChannelCreated', () => {
    it('broadcasts to all clients', () => {
      const client1 = createMockSocket({ channelId: 1 })
      const client2 = createMockSocket({ channelId: 2 })
      const wss = createMockWss([client1, client2])

      handleChannelCreated(wss, { type: 'channel:created', channel: { id: 3, name: 'new-channel', createdBy: null } })

      expect(client1.send).toHaveBeenCalledOnce()
      expect(client2.send).toHaveBeenCalledOnce()
    })
  })

  describe('isAuthedSocket', () => {
    it('returns true for socket with user', () => {
      const ws = createMockSocket({ user: { userId: 1, username: 'alice' } })
      expect(isAuthedSocket(ws)).toBe(true)
    })

    it('returns false for socket without user', () => {
      const ws = createMockSocket({ user: undefined })
      expect(isAuthedSocket(ws)).toBe(false)
    })
  })
})
