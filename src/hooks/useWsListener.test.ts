import type { MessageHandler } from '~/lib/ws-client.types'
import type { ServerWsMessage } from '~/lib/ws-types'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { wsClient } from '~/lib/ws-client'
import { useChatStore } from '~/stores/chat'

import { useTypingStore } from '~/stores/typing'
import { useWsListener } from './useWsListener'

const handlers: MessageHandler[] = []

vi.mock('~/lib/ws-client', () => ({
  wsClient: {
    connect: vi.fn(),
    send: vi.fn(),
    onMessage: vi.fn((handler: MessageHandler) => {
      handlers.push(handler)
      return () => {
        const idx = handlers.indexOf(handler)
        if (idx >= 0)
          handlers.splice(idx, 1)
      }
    }),
    disconnect: vi.fn(),
  },
}))

const emit = (data: ServerWsMessage) => handlers.forEach(h => h(data))

describe('useWsListener', () => {
  beforeEach(() => {
    handlers.length = 0
    useChatStore.setState({
      channelId: 1,
      channels: [],
      messages: [],
      messagesLoading: false,
      onlineUsers: [],
      channelCounts: {},
    })
    useTypingStore.setState({ typingUsers: {} })
    vi.clearAllMocks()
  })

  it('calls ws.connect() on mount', () => {
    renderHook(() => useWsListener())
    expect(wsClient.connect).toHaveBeenCalled()
  })

  it('calls ws.disconnect() on unmount', () => {
    const { unmount } = renderHook(() => useWsListener())

    unmount()

    expect(wsClient.disconnect).toHaveBeenCalled()
  })

  it('message:new adds message when channelId matches', () => {
    renderHook(() => useWsListener())

    const message = { id: 1, content: 'hi', username: 'alice', userId: 1, createdAt: new Date().toISOString() }
    emit({ type: 'message:new', channelId: 1, message })

    expect(useChatStore.getState().messages).toHaveLength(1)
    expect(useChatStore.getState().messages[0].id).toBe(1)
  })

  it('message:new ignores message when channelId does not match', () => {
    renderHook(() => useWsListener())

    const message = { id: 1, content: 'hi', username: 'alice', userId: 1, createdAt: new Date().toISOString() }
    emit({ type: 'message:new', channelId: 999, message })

    expect(useChatStore.getState().messages).toHaveLength(0)
  })

  it('channel:created adds channel to store', () => {
    renderHook(() => useWsListener())

    emit({ type: 'channel:created', channel: { id: 5, name: 'new-channel', createdBy: null } })

    expect(useChatStore.getState().channels).toContainEqual({ id: 5, name: 'new-channel', createdBy: null })
  })

  it('presence:update sets online users', () => {
    renderHook(() => useWsListener())

    const users = [{ userId: 1, username: 'alice' }]
    emit({ type: 'presence:update', users })

    expect(useChatStore.getState().onlineUsers).toEqual(users)
  })

  it('typing:start updates typing store', () => {
    renderHook(() => useWsListener())

    emit({ type: 'typing:start', userId: 2, username: 'bob' })

    expect(useTypingStore.getState().typingUsers).toEqual({ 2: 'bob' })
  })

  it('typing:stop updates typing store', () => {
    useTypingStore.getState().startTyping(2, 'bob')
    renderHook(() => useWsListener())

    emit({ type: 'typing:stop', userId: 2 })

    expect(useTypingStore.getState().typingUsers).toEqual({})
  })

  it('user:joined adds system message', () => {
    renderHook(() => useWsListener())

    emit({ type: 'user:joined', username: 'charlie' })

    const messages = useChatStore.getState().messages
    expect(messages).toHaveLength(1)
    expect(messages[0].content).toBe('charlie has joined the chat')
  })
})
