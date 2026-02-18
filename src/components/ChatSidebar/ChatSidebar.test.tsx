import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChatSidebar } from './ChatSidebar'

const channels = [
  { id: 1, name: 'general', createdBy: null },
  { id: 2, name: 'random', createdBy: 1 },
]

const defaultProps = {
  channels,
  currentChannelId: null as number | null,
  onSelectChannel: vi.fn(),
  onCreateChannel: vi.fn(),
  onLogout: vi.fn(),
}

describe('chatSidebar', () => {
  it('renders channel list', () => {
    render(<ChatSidebar {...defaultProps} />)

    expect(screen.getByText('general')).toBeTruthy()
    expect(screen.getByText('random')).toBeTruthy()
  })

  it('highlights the selected channel', () => {
    render(<ChatSidebar {...defaultProps} currentChannelId={1} />)

    const selected = screen.getByText('general').closest('[role="button"]')
    expect(selected?.classList.toString()).toContain('selected')
  })

  it('calls onSelectChannel when a channel is clicked', () => {
    const onSelectChannel = vi.fn()
    render(<ChatSidebar {...defaultProps} currentChannelId={1} onSelectChannel={onSelectChannel} />)

    fireEvent.click(screen.getByText('random'))
    expect(onSelectChannel).toHaveBeenCalledWith(2)
  })

  it('shows user count for channel', () => {
    render(<ChatSidebar {...defaultProps} channelCounts={{ 1: 3 }} />)

    expect(screen.getByText('3')).toBeTruthy()
  })

  it('renders empty list when no channels', () => {
    render(<ChatSidebar {...defaultProps} channels={[]} />)

    expect(screen.getByText('TanChat')).toBeTruthy()
  })

  it('calls onLogout when logout button is clicked', () => {
    const onLogout = vi.fn()
    render(<ChatSidebar {...defaultProps} onLogout={onLogout} />)

    fireEvent.click(screen.getByText('Log out'))
    expect(onLogout).toHaveBeenCalled()
  })
})
