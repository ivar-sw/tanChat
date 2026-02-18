import type { Channel } from '~/lib/ws-types'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChannelList } from './ChannelList'

const channels: Channel[] = [
  { id: 1, name: 'general', createdBy: null },
  { id: 2, name: 'random', createdBy: 1 },
]

const defaultProps = {
  channels,
  currentChannelId: null as number | null,
  onSelectChannel: vi.fn(),
  onDeleteChannel: vi.fn(),
  channelCounts: {},
  currentUserId: 1,
}

describe('channelList', () => {
  it('renders all channels', () => {
    render(<ChannelList {...defaultProps} />)

    expect(screen.getByText('general')).toBeTruthy()
    expect(screen.getByText('random')).toBeTruthy()
  })

  it('calls onSelectChannel when clicking a channel', () => {
    const onSelectChannel = vi.fn()
    render(<ChannelList {...defaultProps} onSelectChannel={onSelectChannel} />)

    fireEvent.click(screen.getByText('random'))

    expect(onSelectChannel).toHaveBeenCalledWith(2)
  })

  it('shows delete button only for own non-general channel', () => {
    render(<ChannelList {...defaultProps} currentUserId={1} />)

    expect(screen.getAllByLabelText('delete channel')).toHaveLength(1)
  })

  it('does not show delete button for non-owner', () => {
    render(<ChannelList {...defaultProps} currentUserId={2} />)

    expect(screen.queryByLabelText('delete channel')).toBeNull()
  })

  it('clicking delete stops channel selection and calls onDeleteChannel', () => {
    const onSelectChannel = vi.fn()
    const onDeleteChannel = vi.fn()
    render(
      <ChannelList
        {...defaultProps}
        onSelectChannel={onSelectChannel}
        onDeleteChannel={onDeleteChannel}
      />,
    )

    fireEvent.click(screen.getByLabelText('delete channel'))

    expect(onDeleteChannel).toHaveBeenCalledWith(channels[1])
    expect(onSelectChannel).not.toHaveBeenCalled()
  })

  it('renders channel count when available', () => {
    render(<ChannelList {...defaultProps} channelCounts={{ 1: 3 }} />)

    expect(screen.getByText('3')).toBeTruthy()
  })
})
