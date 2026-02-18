import type { Message, OnlineUser } from '~/lib/ws-types'
import { Stack } from '@mui/material'
import { useEffect, useRef } from 'react'
import { ChatInput, ChatMessage, OnlineUsersBar, TypingIndicator } from '~/components'

interface Props {
  messages: Message[]
  onlineUsers: OnlineUser[]
  typingUsers: string[]
  currentUserId: number
  onSend: (content: string) => Promise<void> | void
  onTyping: () => void
  onStopTyping: () => void
}

export const MainChat = ({
  messages,
  onlineUsers,
  typingUsers,
  currentUserId,
  onSend,
  onTyping,
  onStopTyping,
}: Props) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView()
  }, [messages])

  return (
    <>
      <OnlineUsersBar users={onlineUsers} currentUserId={currentUserId} />

      <Stack flex={1} overflow="auto" spacing={1} p={2}>
        {messages.map(msg => (
          <ChatMessage
            key={msg.id}
            content={msg.content}
            username={msg.username}
            userId={msg.userId}
            isOwn={msg.userId === currentUserId}
            timestamp={msg.createdAt}
          />
        ))}
        <div ref={messagesEndRef} />
      </Stack>

      <Stack spacing={0.5} px={2} pb={0.5}>
        <TypingIndicator typingUsers={typingUsers} />
      </Stack>

      <ChatInput
        onSend={onSend}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
      />
    </>
  )
}
