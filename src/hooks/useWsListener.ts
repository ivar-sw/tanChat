import { useEffect } from 'react'
import { wsClient } from '~/lib/ws-client'
import { useChatStore } from '~/stores/chat'
import { useTypingStore } from '~/stores/typing'

export const useWsListener = () => {
  const { addMessage, addChannel, removeChannel, addSystemMessage, setOnlineUsers, setChannelCounts } = useChatStore()
  const { startTyping, stopTyping } = useTypingStore()

  useEffect(() => {
    wsClient.connect()

    const unsub = wsClient.onMessage((data) => {
      switch (data.type) {
        case 'message:new':
          if (data.channelId === useChatStore.getState().channelId) {
            addMessage(data.message)
          }
          break

        case 'presence:update':
          setOnlineUsers(data.users)
          break

        case 'channel:created':
          addChannel(data.channel)
          break

        case 'channel:deleted':
          removeChannel(data.channelId)
          break

        case 'channel:counts':
          setChannelCounts(data.counts)
          break

        case 'typing:start':
          startTyping(data.userId, data.username)
          break

        case 'typing:stop':
          stopTyping(data.userId)
          break

        case 'user:joined':
          addSystemMessage(`${data.username} has joined the chat`)
          break
      }
    })

    return () => {
      unsub()
      wsClient.disconnect()
    }
  }, [addMessage, addChannel, removeChannel, addSystemMessage, setOnlineUsers, setChannelCounts, startTyping, stopTyping])
}
