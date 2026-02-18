import type { WebSocketServer } from 'ws'
import type { JwtPayload } from './auth'
import type { ClientWsMessage, ServerWsMessage } from '~/lib/ws-types'
import { WebSocket } from 'ws'
import { loadMessageForBroadcast } from './ws-message-helpers'

export interface AuthedSocket extends WebSocket {
  user?: JwtPayload
  channelId?: number
}

export const isAuthedSocket = (ws: WebSocket): ws is AuthedSocket => {
  return 'user' in ws && (ws as AuthedSocket).user !== undefined
}

export const broadcast = (wss: WebSocketServer, channelId: number, data: ServerWsMessage, exclude?: AuthedSocket) => {
  const payload = JSON.stringify(data)
  for (const client of wss.clients) {
    if (!isAuthedSocket(client))
      continue
    if (client !== exclude && client.readyState === WebSocket.OPEN && client.channelId === channelId) {
      client.send(payload)
    }
  }
}

export const broadcastAll = (wss: WebSocketServer, data: ServerWsMessage) => {
  const payload = JSON.stringify(data)
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload)
    }
  }
}

export const getOnlineUsers = (wss: WebSocketServer, channelId: number): { userId: number, username: string }[] => {
  const users = new Map<number, string>()
  for (const client of wss.clients) {
    if (!isAuthedSocket(client))
      continue
    if (client.readyState === WebSocket.OPEN && client.channelId === channelId && client.user) {
      users.set(client.user.userId, client.user.username)
    }
  }
  return Array.from(users, ([userId, username]) => ({ userId, username }))
}

export const getChannelCounts = (wss: WebSocketServer): Record<number, number> => {
  const usersByChannel = new Map<number, Set<number>>()

  for (const client of wss.clients) {
    if (!isAuthedSocket(client))
      continue
    if (client.readyState !== WebSocket.OPEN)
      continue
    if (client.channelId === undefined || !client.user)
      continue

    const users = usersByChannel.get(client.channelId) ?? new Set<number>()
    users.add(client.user.userId)
    usersByChannel.set(client.channelId, users)
  }

  const counts: Record<number, number> = {}
  for (const [channelId, users] of usersByChannel) {
    counts[channelId] = users.size
  }

  return counts
}

export const handleChannelJoin = (wss: WebSocketServer, ws: AuthedSocket, msg: Extract<ClientWsMessage, { type: 'channel:join' }>, user: JwtPayload) => {
  const oldChannel = ws.channelId
  ws.channelId = msg.channelId

  if (oldChannel !== undefined) {
    broadcast(wss, oldChannel, {
      type: 'presence:update',
      users: getOnlineUsers(wss, oldChannel),
    })
  }

  broadcast(wss, msg.channelId, {
    type: 'presence:update',
    users: getOnlineUsers(wss, msg.channelId),
  })
  broadcast(wss, msg.channelId, {
    type: 'user:joined',
    username: user.username,
  }, ws)
  broadcastAll(wss, { type: 'channel:counts', counts: getChannelCounts(wss) })
}

export const handleNewMessage = async (wss: WebSocketServer, ws: AuthedSocket, msg: Extract<ClientWsMessage, { type: 'message:new' }>, user: JwtPayload) => {
  if (ws.channelId === undefined || ws.channelId !== msg.channelId)
    return

  const message = await loadMessageForBroadcast(msg.messageId)
  if (!message)
    return
  if (message.userId !== user.userId)
    return
  if (message.channelId !== msg.channelId)
    return

  broadcast(wss, msg.channelId, {
    type: 'message:new',
    message: {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      userId: message.userId,
      username: message.username,
    },
    channelId: msg.channelId,
  })
}

export const handleTypingStart = (wss: WebSocketServer, ws: AuthedSocket, user: JwtPayload) => {
  if (ws.channelId === undefined)
    return
  broadcast(wss, ws.channelId, {
    type: 'typing:start',
    userId: user.userId,
    username: user.username,
  }, ws)
}

export const handleTypingStop = (wss: WebSocketServer, ws: AuthedSocket, user: JwtPayload) => {
  if (ws.channelId === undefined)
    return
  broadcast(wss, ws.channelId, {
    type: 'typing:stop',
    userId: user.userId,
  }, ws)
}

export const handleChannelCreated = (wss: WebSocketServer, msg: Extract<ServerWsMessage, { type: 'channel:created' }>) => {
  broadcastAll(wss, { type: 'channel:created', channel: msg.channel })
}

export const handleChannelDeleted = (wss: WebSocketServer, msg: Extract<ServerWsMessage, { type: 'channel:deleted' }>) => {
  broadcastAll(wss, { type: 'channel:deleted', channelId: msg.channelId })
}
