import { render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { MainChat } from './MainChat'

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

const baseProps = {
  messages: [
    { id: 1, content: 'hello', username: 'alice', userId: 1, createdAt: new Date().toISOString() },
    { id: 2, content: 'world', username: 'bob', userId: 2, createdAt: new Date().toISOString() },
  ],
  onlineUsers: [
    { userId: 1, username: 'alice' },
  ],
  typingUsers: [] as string[],
  currentUserId: 1,
  onSend: vi.fn(),
  onTyping: vi.fn(),
  onStopTyping: vi.fn(),
}

describe('mainChat', () => {
  it('renders messages', () => {
    render(<MainChat {...baseProps} />)
    expect(screen.getByText('hello')).toBeTruthy()
    expect(screen.getByText('world')).toBeTruthy()
  })

  it('renders online users', () => {
    render(<MainChat {...baseProps} />)
    expect(screen.getByText('alice')).toBeTruthy()
  })

  it('renders chat input', () => {
    render(<MainChat {...baseProps} />)
    expect(screen.getByPlaceholderText('Type a message...')).toBeTruthy()
  })
})
