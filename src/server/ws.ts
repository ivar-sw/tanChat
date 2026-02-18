import type { IncomingMessage } from 'node:http'
import type { JwtPayload } from './auth'
import type { AuthedSocket } from './ws-handlers'
import { parse as parseCookie } from 'cookie'
import { WebSocketServer } from 'ws'
import { logger } from '~/lib/logger'
import { clientWsMessageSchema } from '~/lib/validation'
import { verifyToken } from './auth'
import {
  broadcast,
  broadcastAll,
  getChannelCounts,
  getOnlineUsers,
  handleChannelJoin,
  handleNewMessage,
  handleTypingStart,
  handleTypingStop,
} from './ws-handlers'

const PORT = Number(process.env.WS_PORT) || 3002

const wss = new WebSocketServer({ port: PORT })

const authenticate = (req: IncomingMessage): JwtPayload | null => {
  const cookieHeader = req.headers.cookie
  if (!cookieHeader)
    return null
  const cookies = parseCookie(cookieHeader)
  const token = cookies.auth_token
  if (!token)
    return null
  return verifyToken(token)
}

wss.on('connection', (ws: AuthedSocket, req) => {
  const user = authenticate(req)
  if (!user) {
    ws.close(4001, 'Unauthorized')
    return
  }

  ws.user = user
  logger.info({ userId: user.userId }, 'WS connected')

  ws.on('message', (raw) => {
    try {
      const msg = clientWsMessageSchema.parse(JSON.parse(raw.toString()))
      switch (msg.type) {
        case 'channel:join':
          handleChannelJoin(wss, ws, msg, user)
          break
        case 'message:new':
          void handleNewMessage(wss, ws, msg, user)
          break
        case 'typing:start':
          handleTypingStart(wss, ws, user)
          break
        case 'typing:stop':
          handleTypingStop(wss, ws, user)
          break
      }
    }
    catch (err) {
      logger.error(err, 'Failed to parse WS message')
    }
  })

  ws.on('close', () => {
    logger.info({ userId: user.userId }, 'WS disconnected')
    if (ws.channelId !== undefined) {
      broadcast(wss, ws.channelId, {
        type: 'presence:update',
        users: getOnlineUsers(wss, ws.channelId),
      })
      broadcast(wss, ws.channelId, {
        type: 'typing:stop',
        userId: user.userId,
      })
    }
    broadcastAll(wss, {
      type: 'channel:counts',
      counts: getChannelCounts(wss),
    })
  })
})

logger.info({ port: PORT }, 'WebSocket server started')
