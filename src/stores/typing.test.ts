import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTypingStore } from './typing'

describe('useTypingStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useTypingStore.getState().clearAll()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('startTyping', () => {
    it('adds a typing user', () => {
      useTypingStore.getState().startTyping(1, 'alice')
      expect(useTypingStore.getState().typingUsers).toEqual({ 1: 'alice' })
    })

    it('handles multiple typing users', () => {
      useTypingStore.getState().startTyping(1, 'alice')
      useTypingStore.getState().startTyping(2, 'bob')
      expect(useTypingStore.getState().typingUsers).toEqual({ 1: 'alice', 2: 'bob' })
    })

    it('auto-clears after timeout', () => {
      useTypingStore.getState().startTyping(1, 'alice')
      expect(useTypingStore.getState().typingUsers).toEqual({ 1: 'alice' })

      vi.advanceTimersByTime(3000)
      expect(useTypingStore.getState().typingUsers).toEqual({})
    })

    it('resets timer on repeated startTyping', () => {
      useTypingStore.getState().startTyping(1, 'alice')

      vi.advanceTimersByTime(2000)
      expect(useTypingStore.getState().typingUsers).toEqual({ 1: 'alice' })

      // Reset the timer
      useTypingStore.getState().startTyping(1, 'alice')

      vi.advanceTimersByTime(2000)
      // Should still be typing since timer was reset
      expect(useTypingStore.getState().typingUsers).toEqual({ 1: 'alice' })

      vi.advanceTimersByTime(1000)
      // Now it should be cleared (3s after last startTyping)
      expect(useTypingStore.getState().typingUsers).toEqual({})
    })
  })

  describe('stopTyping', () => {
    it('removes a typing user', () => {
      useTypingStore.getState().startTyping(1, 'alice')
      useTypingStore.getState().startTyping(2, 'bob')
      useTypingStore.getState().stopTyping(1)
      expect(useTypingStore.getState().typingUsers).toEqual({ 2: 'bob' })
    })

    it('handles stopping a non-existent user gracefully', () => {
      useTypingStore.getState().stopTyping(999)
      expect(useTypingStore.getState().typingUsers).toEqual({})
    })
  })

  describe('clearAll', () => {
    it('clears all typing users and timers', () => {
      useTypingStore.getState().startTyping(1, 'alice')
      useTypingStore.getState().startTyping(2, 'bob')
      useTypingStore.getState().clearAll()
      expect(useTypingStore.getState().typingUsers).toEqual({})
    })
  })
})
