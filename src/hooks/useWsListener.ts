import { useEffect } from 'react'
import { wsClient } from '~/lib/ws-client'
import { useChatStore } from '~/stores/chat'
import { useTypingStore } from '~/stores/typing'

export const useWsListener = () => {
  const addMessage = useChatStore(state => state.addMessage)
  const setChannelId = useChatStore(state => state.setChannelId)
  const addChannel = useChatStore(state => state.addChannel)
  const removeChannel = useChatStore(state => state.removeChannel)
  const addSystemMessage = useChatStore(state => state.addSystemMessage)
  const setOnlineUsers = useChatStore(state => state.setOnlineUsers)
  const setChannelCounts = useChatStore(state => state.setChannelCounts)
  const startTyping = useTypingStore(state => state.startTyping)
  const stopTyping = useTypingStore(state => state.stopTyping)

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

        case 'channel:deleted': {
          const state = useChatStore.getState()
          const deletedChannel = state.channels.find(channel => channel.id === data.channelId)
          const deletedChannelName = deletedChannel?.name ?? `#${data.channelId}`
          const isDeletedChannelActive = state.channelId === data.channelId

          removeChannel(data.channelId)

          if (isDeletedChannelActive) {
            const generalChannel = state.channels.find(channel => channel.name === 'general' && channel.id !== data.channelId)
            if (generalChannel) {
              setChannelId(generalChannel.id)
              addSystemMessage(`You were moved from channel: ${deletedChannelName} because it was removed`)
            }
          }
          break
        }

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

        case 'user:left':
          addSystemMessage(`${data.username} has left the channel`)
          break
      }
    })

    return () => {
      unsub()
      wsClient.disconnect()
    }
  }, [addMessage, setChannelId, addChannel, removeChannel, addSystemMessage, setOnlineUsers, setChannelCounts, startTyping, stopTyping])
}
