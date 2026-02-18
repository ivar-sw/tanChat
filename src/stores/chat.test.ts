import { beforeEach, describe, expect, it } from 'vitest'
import { SYSTEM_USER_ID } from '~/lib/ws-types'
import { useChatStore } from './chat'

describe('useChatStore', () => {
  beforeEach(() => {
    useChatStore.setState({
      channelId: null,
      channels: [],
      messages: [],
      messagesLoading: false,
      onlineUsers: [],
      channelCounts: {},
    })
  })

  describe('setChannelId', () => {
    it('sets channelId and clears messages', () => {
      useChatStore.getState().setMessages([
        { id: 1, content: 'hello', username: 'alice', userId: 1, createdAt: new Date() },
      ])

      useChatStore.getState().setChannelId(42)

      const state = useChatStore.getState()
      expect(state.channelId).toBe(42)
      expect(state.messages).toEqual([])
    })

    it('sets channelId to null', () => {
      useChatStore.getState().setChannelId(1)
      useChatStore.getState().setChannelId(null)
      expect(useChatStore.getState().channelId).toBeNull()
    })
  })

  describe('addMessage', () => {
    it('adds a new message', () => {
      const message = { id: 1, content: 'hi', username: 'bob', userId: 2, createdAt: new Date() }
      useChatStore.getState().addMessage(message)
      expect(useChatStore.getState().messages).toHaveLength(1)
      expect(useChatStore.getState().messages[0]).toEqual(message)
    })

    it('deduplicates messages with the same id', () => {
      const message = { id: 1, content: 'hi', username: 'bob', userId: 2, createdAt: new Date() }
      useChatStore.getState().addMessage(message)
      useChatStore.getState().addMessage(message)
      expect(useChatStore.getState().messages).toHaveLength(1)
    })

    it('adds messages with different ids', () => {
      const msg1 = { id: 1, content: 'hi', username: 'bob', userId: 2, createdAt: new Date() }
      const msg2 = { id: 2, content: 'hey', username: 'alice', userId: 1, createdAt: new Date() }
      useChatStore.getState().addMessage(msg1)
      useChatStore.getState().addMessage(msg2)
      expect(useChatStore.getState().messages).toHaveLength(2)
    })
  })

  describe('addSystemMessage', () => {
    it('adds a system message with SYSTEM_USER_ID', () => {
      useChatStore.getState().addSystemMessage('User joined')

      const messages = useChatStore.getState().messages
      expect(messages).toHaveLength(1)
      expect(messages[0].userId).toBe(SYSTEM_USER_ID)
      expect(messages[0].username).toBe('system')
      expect(messages[0].content).toBe('User joined')
    })

    it('assigns a negative id to system messages', () => {
      useChatStore.getState().addSystemMessage('test')
      expect(useChatStore.getState().messages[0].id).toBeLessThan(0)
    })
  })

  describe('setOnlineUsers', () => {
    it('sets online users', () => {
      const users = [{ userId: 1, username: 'alice' }]
      useChatStore.getState().setOnlineUsers(users)
      expect(useChatStore.getState().onlineUsers).toEqual(users)
    })
  })

  describe('setChannelCounts', () => {
    it('sets channel counts', () => {
      const counts = { 1: 3, 2: 5 }
      useChatStore.getState().setChannelCounts(counts)
      expect(useChatStore.getState().channelCounts).toEqual(counts)
    })
  })

  describe('setMessages merge', () => {
    it('preserves WS-only messages not in fetched set', () => {
      const wsMessage = { id: 99, content: 'ws-only', username: 'bob', userId: 2, createdAt: new Date() }
      useChatStore.getState().addMessage(wsMessage)

      const fetched = [
        { id: 1, content: 'old', username: 'alice', userId: 1, createdAt: new Date() },
      ]
      useChatStore.getState().setMessages(fetched)

      const messages = useChatStore.getState().messages
      expect(messages).toHaveLength(2)
      expect(messages[0].id).toBe(1)
      expect(messages[1].id).toBe(99)
    })

    it('does not duplicate messages present in both fetched and existing', () => {
      const msg = { id: 1, content: 'hi', username: 'alice', userId: 1, createdAt: new Date() }
      useChatStore.getState().addMessage(msg)

      useChatStore.getState().setMessages([msg])

      expect(useChatStore.getState().messages).toHaveLength(1)
    })
  })

  describe('setChannels merge', () => {
    it('preserves WS-only channels not in fetched set', () => {
      useChatStore.getState().addChannel({ id: 99, name: 'ws-channel', createdBy: null })

      useChatStore.getState().setChannels([{ id: 1, name: 'general', createdBy: null }])

      const channels = useChatStore.getState().channels
      expect(channels).toHaveLength(2)
      expect(channels[0].id).toBe(1)
      expect(channels[1].id).toBe(99)
    })

    it('does not duplicate channels present in both fetched and existing', () => {
      useChatStore.getState().addChannel({ id: 1, name: 'general', createdBy: null })

      useChatStore.getState().setChannels([{ id: 1, name: 'general', createdBy: null }])

      expect(useChatStore.getState().channels).toHaveLength(1)
    })
  })

  describe('addChannel', () => {
    it('adds a new channel', () => {
      useChatStore.getState().addChannel({ id: 1, name: 'general', createdBy: null })
      expect(useChatStore.getState().channels).toHaveLength(1)
    })

    it('deduplicates channels with the same id', () => {
      useChatStore.getState().addChannel({ id: 1, name: 'general', createdBy: null })
      useChatStore.getState().addChannel({ id: 1, name: 'general', createdBy: null })
      expect(useChatStore.getState().channels).toHaveLength(1)
    })

    it('adds channels with different ids', () => {
      useChatStore.getState().addChannel({ id: 1, name: 'general', createdBy: null })
      useChatStore.getState().addChannel({ id: 2, name: 'random', createdBy: 1 })
      expect(useChatStore.getState().channels).toHaveLength(2)
    })
  })
})
