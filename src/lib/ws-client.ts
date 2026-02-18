import type { MessageHandler, WsClient } from './ws-client.types'
import type { ClientWsMessage, ServerWsMessage } from './ws-types'

const DEFAULT_WS_PORT = 3002

const resolveWsUrl = (wsUrl?: string, wsPort = DEFAULT_WS_PORT) => {
  if (wsUrl)
    return wsUrl

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.hostname
  return `${protocol}//${host}:${wsPort}`
}

export const createWsClient = (): WsClient => {
  let socket: WebSocket | null = null
  const listeners = new Set<MessageHandler>()
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  const pendingMessages: string[] = []
  let shouldReconnect = true
  const envWsUrl = import.meta.env.VITE_WS_URL as string | undefined
  const envWsPort = Number(import.meta.env.VITE_WS_PORT ?? DEFAULT_WS_PORT)

  const connect = () => {
    shouldReconnect = true

    if (
      socket
      && (socket.readyState === WebSocket.OPEN
        || socket.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    const ws = new WebSocket(resolveWsUrl(envWsUrl, envWsPort))
    socket = ws

    ws.addEventListener('open', () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      while (pendingMessages.length > 0) {
        ws.send(pendingMessages.shift()!)
      }
    })

    ws.addEventListener('message', (event) => {
      try {
        const data: ServerWsMessage = JSON.parse(event.data)
        listeners.forEach(handler => handler(data))
      }
      catch (err) {
        console.error('Failed to parse WS message:', err)
      }
    })

    ws.addEventListener('close', () => {
      socket = null
      if (shouldReconnect)
        reconnectTimer = setTimeout(connect, 2000)
    })
  }

  const send = (data: ClientWsMessage) => {
    const payload = JSON.stringify(data)
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(payload)
    }
    else {
      pendingMessages.push(payload)
    }
  }

  const onMessage = (handler: MessageHandler): (() => void) => {
    listeners.add(handler)
    return () => {
      listeners.delete(handler)
    }
  }

  const disconnect = () => {
    shouldReconnect = false
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (socket) {
      socket.close()
      socket = null
    }
    listeners.clear()
    pendingMessages.length = 0
  }

  return { connect, send, onMessage, disconnect }
}

export const wsClient = createWsClient()
