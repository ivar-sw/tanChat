import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OnlineUsersBar } from './OnlineUsersBar'

describe('onlineUsersBar', () => {
  it('returns null when no users online', () => {
    const { container } = render(<OnlineUsersBar users={[]} currentUserId={1} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders usernames as chips', () => {
    const users = [
      { userId: 1, username: 'alice' },
      { userId: 2, username: 'bob' },
    ]
    render(<OnlineUsersBar users={users} currentUserId={1} />)
    expect(screen.getByText('alice')).toBeTruthy()
    expect(screen.getByText('bob')).toBeTruthy()
  })
})
