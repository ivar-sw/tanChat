import { useCallback, useEffect } from 'react'
import { wsClient } from '~/lib/ws-client'
import { getMessages, sendMessage } from '~/server/rpc/chat'
import { useChatStore } from '~/stores/chat'
import { useTypingStore } from '~/stores/typing'
import { useWsListener } from './useWsListener'

export const useChat = () => {
  const channelId = useChatStore(state => state.channelId)
  const setMessages = useChatStore(state => state.setMessages)
  const setMessagesLoading = useChatStore(state => state.setMessagesLoading)
  const clearTyping = useTypingStore(state => state.clearAll)

  useWsListener()

  useEffect(() => {
    if (channelId === null)
      return

    wsClient.send({ type: 'channel:join', channelId })
    clearTyping()
    setMessagesLoading(true)

    getMessages({ data: { channelId } })
      .then((fetchedMessages) => {
        setMessages(fetchedMessages.reverse())
      })
      .finally(() => {
        setMessagesLoading(false)
      })
  }, [channelId, setMessages, setMessagesLoading, clearTyping])

  const send = useCallback(
    async (content: string) => {
      if (channelId === null)
        return
      const savedMessage = await sendMessage({ data: { channelId, content } })
      wsClient.send({
        type: 'message:new',
        channelId,
        messageId: savedMessage.id,
      })
      wsClient.send({ type: 'typing:stop' })
    },
    [channelId],
  )

  const sendTyping = useCallback(() => {
    wsClient.send({ type: 'typing:start' })
  }, [])

  const stopTyping = useCallback(() => {
    wsClient.send({ type: 'typing:stop' })
  }, [])

  return { send, sendTyping, stopTyping }
}
