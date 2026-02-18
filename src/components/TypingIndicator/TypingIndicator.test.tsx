import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TypingIndicator } from './TypingIndicator'

describe('typingIndicator', () => {
  it('returns null when no users are typing', () => {
    const { container } = render(<TypingIndicator typingUsers={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders singular form for one user', () => {
    render(<TypingIndicator typingUsers={['alice']} />)
    expect(screen.getByText('alice is typing...')).toBeTruthy()
  })

  it('renders plural form for multiple users', () => {
    render(<TypingIndicator typingUsers={['alice', 'bob']} />)
    expect(screen.getByText('alice, bob are typing...')).toBeTruthy()
  })
})
