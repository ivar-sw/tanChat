import { Drawer, Stack, useMediaQuery, useTheme } from '@mui/material'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { ChatSidebar, MainChat, MobileAppBar, PalmSpinner } from '~/components'
import { useChannels } from '~/hooks/useChannels'
import { useChat } from '~/hooks/useChat'
import { useMinDelay } from '~/hooks/useMinDelay'
import { wsClient } from '~/lib/ws-client'
import { getSession, logout } from '~/server/rpc/auth'
import { useChatStore } from '~/stores/chat'
import { useTypingStore } from '~/stores/typing'

const ChatPage = () => {
  const { session } = Route.useRouteContext()

  const channelId = useChatStore(state => state.channelId)
  const messages = useChatStore(state => state.messages)
  const messagesLoading = useChatStore(state => state.messagesLoading)
  const onlineUsers = useChatStore(state => state.onlineUsers)
  const channelCounts = useChatStore(state => state.channelCounts)
  const setChannelId = useChatStore(state => state.setChannelId)
  const typingUsersMap = useTypingStore(state => state.typingUsers)
  const typingUsers = useMemo(() => Object.values(typingUsersMap), [typingUsersMap])

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navigate = useNavigate()
  const { send, sendTyping, stopTyping } = useChat()
  const { channels, create: createChannel, remove: removeChannel } = useChannels()

  const channelsReady = useMinDelay(channels.length > 0, 500)

  const currentChannelName = useMemo(
    () => channels.find(c => c.id === channelId)?.name ?? null,
    [channels, channelId],
  )

  const handleSelectChannel = (id: number) => {
    setChannelId(id)
    if (isMobile)
      setDrawerOpen(false)
  }

  const handleLogout = async () => {
    wsClient.disconnect()
    await logout()
    navigate({ to: '/login' })
  }

  useEffect(() => {
    if (channelsReady && channelId === null) {
      setChannelId(channels[0].id)
    }
  }, [channels, channelId, channelsReady, setChannelId])

  const sidebar = (
    <ChatSidebar
      channels={channels}
      currentChannelId={channelId}
      onSelectChannel={handleSelectChannel}
      onCreateChannel={createChannel}
      onDeleteChannel={removeChannel}
      onLogout={handleLogout}
      channelCounts={channelCounts}
      currentUserId={session.userId}
    />
  )

  return (
    <Stack direction="row" sx={{ 'height': '100dvh', '@supports not (height: 1dvh)': { height: '100vh' } }}>
      {isMobile
        ? (
            <Drawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              slotProps={{ paper: { sx: { width: 240 } } }}
            >
              {sidebar}
            </Drawer>
          )
        : (
            sidebar
          )}

      <Stack flex={1} overflow="hidden" sx={{ background: 'url(/bg.jpg) bottom center / cover no-repeat' }}>
        {isMobile && (
          <MobileAppBar
            channelName={currentChannelName}
            onMenuOpen={() => setDrawerOpen(true)}
          />
        )}

        {channelId === null || messagesLoading
          ? (
              <Stack flex={1} alignItems="center" justifyContent="center">
                <PalmSpinner />
              </Stack>
            )
          : (
              <MainChat
                messages={messages}
                onlineUsers={onlineUsers}
                typingUsers={typingUsers}
                currentUserId={session.userId}
                onSend={send}
                onTyping={sendTyping}
                onStopTyping={stopTyping}
              />
            )}
      </Stack>
    </Stack>
  )
}

export const Route = createFileRoute('/chat')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
    return { session }
  },
  component: ChatPage,
})
