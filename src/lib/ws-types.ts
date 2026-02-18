export const SYSTEM_USER_ID = 0

export interface Message {
  id: number
  content: string
  username: string
  userId: number
  createdAt: Date | string
}

export interface OnlineUser {
  userId: number
  username: string
}

export interface Channel {
  id: number
  name: string
  createdBy: number | null
}

// Client -> Server
export type ClientWsMessage
  = | { type: 'channel:join', channelId: number }
    | { type: 'message:new', channelId: number, messageId: number }
    | { type: 'typing:start' }
    | { type: 'typing:stop' }

// Server -> Client
export type ServerWsMessage
  = | { type: 'message:new', channelId: number, message: Message }
    | { type: 'presence:update', users: OnlineUser[] }
    | { type: 'channel:counts', counts: Record<number, number> }
    | { type: 'typing:start', userId: number, username: string }
    | { type: 'typing:stop', userId: number }
    | { type: 'user:joined', username: string }
    | { type: 'channel:created', channel: Channel }
    | { type: 'channel:deleted', channelId: number }
