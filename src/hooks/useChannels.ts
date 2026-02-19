import { useCallback, useEffect } from 'react'
import { wsClient } from '~/lib/ws-client'
import { createChannel, deleteChannel, getChannels } from '~/server/rpc/chat'
import { useChatStore } from '~/stores/chat'

export const useChannels = () => {
  const channels = useChatStore(state => state.channels)
  const setChannels = useChatStore(state => state.setChannels)
  const addChannel = useChatStore(state => state.addChannel)
  const removeChannel = useChatStore(state => state.removeChannel)

  useEffect(() => {
    getChannels().then((fetched) => {
      setChannels(fetched)
    })
  }, [setChannels])

  const create = useCallback(
    async (name: string) => {
      const channel = await createChannel({ data: { name } })
      addChannel(channel)
      wsClient.send({ type: 'channel:created', channel })
      return channel
    },
    [addChannel],
  )

  const remove = useCallback(
    async (channelId: number) => {
      await deleteChannel({ data: { channelId } })
      removeChannel(channelId)
      wsClient.send({ type: 'channel:deleted', channelId })
    },
    [removeChannel],
  )

  return { channels, create, remove }
}
