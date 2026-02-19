import { describe, expect, it } from 'vitest'
import {
  authInputSchema,
  channelIdSchema,
  channelNameSchema,
  clientWsMessageSchema,
  createChannelInputSchema,
  getMessagesInputSchema,
  messageContentSchema,
  passwordSchema,
  sendMessageInputSchema,
  usernameSchema,
} from './validation'

describe('validation schemas', () => {
  describe('usernameSchema', () => {
    it('accepts valid username', () => {
      expect(usernameSchema.parse('alice')).toBe('alice')
    })

    it('trims whitespace', () => {
      expect(usernameSchema.parse('  alice  ')).toBe('alice')
    })

    it('rejects empty string', () => {
      expect(() => usernameSchema.parse('')).toThrow()
    })

    it('rejects whitespace-only string', () => {
      expect(() => usernameSchema.parse('   ')).toThrow()
    })

    it('rejects string over 30 chars', () => {
      expect(() => usernameSchema.parse('a'.repeat(31))).toThrow()
    })
  })

  describe('passwordSchema', () => {
    it('accepts valid password', () => {
      expect(passwordSchema.parse('secret123')).toBe('secret123')
    })

    it('rejects password shorter than 6 chars', () => {
      expect(() => passwordSchema.parse('short')).toThrow()
    })

    it('rejects password over 64 chars', () => {
      expect(() => passwordSchema.parse('a'.repeat(65))).toThrow()
    })
  })

  describe('channelNameSchema', () => {
    it('accepts valid channel name', () => {
      expect(channelNameSchema.parse('general')).toBe('general')
    })

    it('trims whitespace', () => {
      expect(channelNameSchema.parse('  general  ')).toBe('general')
    })

    it('rejects empty string', () => {
      expect(() => channelNameSchema.parse('')).toThrow()
    })

    it('rejects string over 20 chars', () => {
      expect(() => channelNameSchema.parse('a'.repeat(21))).toThrow()
    })
  })

  describe('messageContentSchema', () => {
    it('accepts valid message', () => {
      expect(messageContentSchema.parse('hello')).toBe('hello')
    })

    it('trims whitespace', () => {
      expect(messageContentSchema.parse('  hello  ')).toBe('hello')
    })

    it('rejects empty string', () => {
      expect(() => messageContentSchema.parse('')).toThrow()
    })

    it('rejects string over 2000 chars', () => {
      expect(() => messageContentSchema.parse('a'.repeat(2001))).toThrow()
    })
  })

  describe('channelIdSchema', () => {
    it('accepts positive integer', () => {
      expect(channelIdSchema.parse(1)).toBe(1)
    })

    it('rejects zero', () => {
      expect(() => channelIdSchema.parse(0)).toThrow()
    })

    it('rejects negative number', () => {
      expect(() => channelIdSchema.parse(-1)).toThrow()
    })

    it('rejects float', () => {
      expect(() => channelIdSchema.parse(1.5)).toThrow()
    })
  })

  describe('authInputSchema', () => {
    it('accepts valid auth input', () => {
      expect(authInputSchema.parse({ username: 'alice', password: 'secret123' }))
        .toEqual({ username: 'alice', password: 'secret123' })
    })

    it('rejects missing username', () => {
      expect(() => authInputSchema.parse({ password: 'secret123' })).toThrow()
    })

    it('rejects missing password', () => {
      expect(() => authInputSchema.parse({ username: 'alice' })).toThrow()
    })
  })

  describe('sendMessageInputSchema', () => {
    it('accepts valid input', () => {
      expect(sendMessageInputSchema.parse({ channelId: 1, content: 'hello' }))
        .toEqual({ channelId: 1, content: 'hello' })
    })

    it('rejects empty content', () => {
      expect(() => sendMessageInputSchema.parse({ channelId: 1, content: '' })).toThrow()
    })
  })

  describe('getMessagesInputSchema', () => {
    it('accepts valid input', () => {
      expect(getMessagesInputSchema.parse({ channelId: 1 })).toEqual({ channelId: 1 })
    })

    it('rejects invalid channelId', () => {
      expect(() => getMessagesInputSchema.parse({ channelId: -1 })).toThrow()
    })
  })

  describe('createChannelInputSchema', () => {
    it('accepts valid input', () => {
      expect(createChannelInputSchema.parse({ name: 'general' })).toEqual({ name: 'general' })
    })

    it('rejects empty name', () => {
      expect(() => createChannelInputSchema.parse({ name: '' })).toThrow()
    })
  })

  describe('clientWsMessageSchema', () => {
    it('accepts channel:join', () => {
      expect(clientWsMessageSchema.parse({ type: 'channel:join', channelId: 1 }))
        .toEqual({ type: 'channel:join', channelId: 1 })
    })

    it('accepts typing:start', () => {
      expect(clientWsMessageSchema.parse({ type: 'typing:start' }))
        .toEqual({ type: 'typing:start' })
    })

    it('accepts typing:stop', () => {
      expect(clientWsMessageSchema.parse({ type: 'typing:stop' }))
        .toEqual({ type: 'typing:stop' })
    })

    it('accepts message:new with messageId payload', () => {
      expect(clientWsMessageSchema.parse({ type: 'message:new', channelId: 1, messageId: 10 }))
        .toEqual({ type: 'message:new', channelId: 1, messageId: 10 })
    })

    it('rejects message:new with invalid messageId', () => {
      expect(() => clientWsMessageSchema.parse({ type: 'message:new', channelId: 1, messageId: 0 })).toThrow()
    })

    it('accepts channel:created from client', () => {
      expect(clientWsMessageSchema.parse({ type: 'channel:created', channel: { id: 1, name: 'test', createdBy: null } }))
        .toEqual({ type: 'channel:created', channel: { id: 1, name: 'test', createdBy: null } })
    })

    it('accepts channel:deleted from client', () => {
      expect(clientWsMessageSchema.parse({ type: 'channel:deleted', channelId: 1 }))
        .toEqual({ type: 'channel:deleted', channelId: 1 })
    })

    it('rejects unknown type', () => {
      expect(() => clientWsMessageSchema.parse({ type: 'unknown' })).toThrow()
    })

    it('rejects channel:join with invalid channelId', () => {
      expect(() => clientWsMessageSchema.parse({ type: 'channel:join', channelId: -1 })).toThrow()
    })
  })
})
