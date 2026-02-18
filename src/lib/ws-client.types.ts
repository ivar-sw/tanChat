import type { ClientWsMessage, ServerWsMessage } from './ws-types'

export type MessageHandler = (data: ServerWsMessage) => void

export interface WsClient {
  connect: () => void
  send: (data: ClientWsMessage) => void
  onMessage: (handler: MessageHandler) => () => void
  disconnect: () => void
}
