import { create } from 'zustand'

interface TypingState {
  typingUsers: Record<number, string>

  startTyping: (userId: number, username: string) => void
  stopTyping: (userId: number) => void
  clearAll: () => void
}

const TYPING_TIMEOUT = 3000

const timers = new Map<number, ReturnType<typeof setTimeout>>()

export const useTypingStore = create<TypingState>((set, get) => ({
  typingUsers: {},

  startTyping: (userId, username) => {
    const existing = timers.get(userId)
    if (existing)
      clearTimeout(existing)

    const timer = setTimeout(() => {
      get().stopTyping(userId)
    }, TYPING_TIMEOUT)

    timers.set(userId, timer)

    set(state => ({
      typingUsers: { ...state.typingUsers, [userId]: username },
    }))
  },

  stopTyping: (userId) => {
    const timer = timers.get(userId)
    if (timer)
      clearTimeout(timer)
    timers.delete(userId)

    set((state) => {
      const { [userId]: _, ...restTypingUsers } = state.typingUsers
      return { typingUsers: restTypingUsers }
    })
  },

  clearAll: () => {
    for (const timer of timers.values()) clearTimeout(timer)
    timers.clear()
    set({ typingUsers: {} })
  },
}))
