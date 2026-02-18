import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SYSTEM_USER_ID } from '~/lib/ws-types'
import { ChatMessage } from './ChatMessage'

describe('chatMessage', () => {
  it('renders a system message for SYSTEM_USER_ID', () => {
    render(
      <ChatMessage
        content="alice has joined"
        username="system"
        userId={SYSTEM_USER_ID}
        isOwn={false}
        timestamp={new Date()}
      />,
    )
    expect(screen.getByText('alice has joined')).toBeTruthy()
  })

  it('renders message content for regular users', () => {
    render(
      <ChatMessage
        content="Hello world"
        username="bob"
        userId={1}
        isOwn={false}
        timestamp={new Date()}
      />,
    )
    expect(screen.getByText('Hello world')).toBeTruthy()
    expect(screen.getByText('bob')).toBeTruthy()
  })

  it('hides username for own messages', () => {
    render(
      <ChatMessage
        content="My message"
        username="alice"
        userId={1}
        isOwn={true}
        timestamp={new Date()}
      />,
    )
    expect(screen.getByText('My message')).toBeTruthy()
    expect(screen.queryByText('alice')).toBeNull()
  })
})
