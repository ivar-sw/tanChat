import type { Channel, Message, OnlineUser } from '~/lib/ws-types'
import { create } from 'zustand'
import { SYSTEM_USER_ID } from '~/lib/ws-types'

interface ChatState {
  channelId: number | null
  channels: Channel[]
  messages: Message[]
  messagesLoading: boolean
  onlineUsers: OnlineUser[]
  channelCounts: Record<number, number>

  setChannelId: (id: number | null) => void
  setMessagesLoading: (loading: boolean) => void
  setChannels: (channels: Channel[]) => void
  addChannel: (channel: Channel) => void
  removeChannel: (channelId: number) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  addSystemMessage: (text: string) => void
  setOnlineUsers: (users: OnlineUser[]) => void
  setChannelCounts: (counts: Record<number, number>) => void
}

let systemMsgCounter = 0

export const useChatStore = create<ChatState>(set => ({
  channelId: null,
  channels: [],
  messages: [],
  messagesLoading: false,
  onlineUsers: [],
  channelCounts: {},

  setChannelId: channelId => set(state =>
    state.channelId === channelId ? state : { channelId, messages: [], messagesLoading: channelId !== null },
  ),
  setMessagesLoading: messagesLoading => set({ messagesLoading }),
  setChannels: fetched =>
    set((state) => {
      const fetchedIds = new Set(fetched.map(c => c.id))
      const wsOnly = state.channels.filter(c => !fetchedIds.has(c.id))
      return { channels: [...fetched, ...wsOnly] }
    }),
  addChannel: channel =>
    set((state) => {
      if (state.channels.some(c => c.id === channel.id))
        return state
      return { channels: [...state.channels, channel] }
    }),
  removeChannel: channelId =>
    set(state => ({
      channels: state.channels.filter(c => c.id !== channelId),
      ...(state.channelId === channelId ? { channelId: null, messages: [] } : {}),
    })),
  setMessages: fetched =>
    set((state) => {
      const fetchedIds = new Set(fetched.map(m => m.id))
      const wsOnly = state.messages.filter(m => !fetchedIds.has(m.id))
      return { messages: [...fetched, ...wsOnly] }
    }),
  addMessage: message =>
    set((state) => {
      if (state.messages.some(existing => existing.id === message.id))
        return state
      return { messages: [...state.messages, message] }
    }),
  addSystemMessage: text =>
    set(state => ({
      messages: [
        ...state.messages,
        {
          id: -(++systemMsgCounter),
          userId: SYSTEM_USER_ID,
          username: 'system',
          content: text,
          createdAt: new Date(),
        },
      ],
    })),
  setOnlineUsers: onlineUsers => set({ onlineUsers }),
  setChannelCounts: channelCounts => set({ channelCounts }),
}))
