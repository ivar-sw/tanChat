import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { wsClient } from '~/lib/ws-client'
import { getMessages, sendMessage } from '~/server/rpc/chat'

import { useChatStore } from '~/stores/chat'
import { useTypingStore } from '~/stores/typing'
import { useChat } from './useChat'

vi.mock('~/server/rpc/chat', () => ({
  getMessages: vi.fn(),
  sendMessage: vi.fn(),
}))

vi.mock('~/lib/ws-client', () => ({
  wsClient: {
    connect: vi.fn(),
    send: vi.fn(),
    onMessage: vi.fn(() => vi.fn()),
    disconnect: vi.fn(),
  },
}))

const mockGetMessages = vi.mocked(getMessages)
const mockSendMessage = vi.mocked(sendMessage)

describe('useChat', () => {
  beforeEach(() => {
    useChatStore.setState({
      channelId: null,
      channels: [],
      messages: [],
      messagesLoading: false,
      onlineUsers: [],
      channelCounts: {},
    })
    useTypingStore.setState({ typingUsers: {} })
    vi.clearAllMocks()
    mockGetMessages.mockResolvedValue([])
  })

  it('sends channel:join and fetches messages when channelId changes', async () => {
    const fetched = [
      { id: 2, content: 'older', username: 'alice', userId: 1, createdAt: new Date() },
      { id: 1, content: 'oldest', username: 'bob', userId: 2, createdAt: new Date() },
    ]
    mockGetMessages.mockResolvedValue(fetched)

    useChatStore.setState({ channelId: 5 })

    renderHook(() => useChat())

    await waitFor(() => {
      expect(wsClient.send).toHaveBeenCalledWith({ type: 'channel:join', channelId: 5 })
      expect(mockGetMessages).toHaveBeenCalledWith({ data: { channelId: 5 } })
      expect(useChatStore.getState().messages).toEqual(fetched.reverse())
      expect(useChatStore.getState().messagesLoading).toBe(false)
    })
  })

  it('does not fetch messages when channelId is null', () => {
    renderHook(() => useChat())

    expect(mockGetMessages).not.toHaveBeenCalled()
    expect(wsClient.send).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'channel:join' }),
    )
  })

  it('send() calls RPC and sends WS message', async () => {
    const savedMessage = { id: 10, content: 'hello', username: 'bob', userId: 2, channelId: 1, createdAt: new Date() }
    mockSendMessage.mockResolvedValue(savedMessage)
    useChatStore.setState({ channelId: 1 })

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.send('hello')
    })

    expect(mockSendMessage).toHaveBeenCalledWith({ data: { channelId: 1, content: 'hello' } })
    expect(useChatStore.getState().messages).toContainEqual(savedMessage)
    expect(wsClient.send).toHaveBeenCalledWith({ type: 'message:new', channelId: 1, messageId: 10 })
    expect(wsClient.send).toHaveBeenCalledWith({ type: 'typing:stop' })
  })

  it('sendTyping() sends typing:start via WS', () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.sendTyping()
    })

    expect(wsClient.send).toHaveBeenCalledWith({ type: 'typing:start' })
  })

  it('stopTyping() sends typing:stop via WS', () => {
    const { result } = renderHook(() => useChat())

    act(() => {
      result.current.stopTyping()
    })

    expect(wsClient.send).toHaveBeenCalledWith({ type: 'typing:stop' })
  })
})
