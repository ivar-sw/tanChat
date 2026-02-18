import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CreateChannelDialog } from './CreateChannelDialog'

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onCreate: vi.fn(),
}

describe('createChannelDialog', () => {
  it('renders title, input and buttons when open', () => {
    render(<CreateChannelDialog {...defaultProps} />)

    expect(screen.getByText('Create channel')).toBeTruthy()
    expect(screen.getByLabelText('Channel name')).toBeTruthy()
    expect(screen.getByText('Cancel')).toBeTruthy()
    expect(screen.getByText('Create')).toBeTruthy()
  })

  it('calls onCreate with valid name on submit', () => {
    const onCreate = vi.fn()
    render(<CreateChannelDialog {...defaultProps} onCreate={onCreate} />)

    fireEvent.change(screen.getByLabelText('Channel name'), { target: { value: 'general' } })
    fireEvent.submit(screen.getByLabelText('Channel name').closest('form')!)

    expect(onCreate).toHaveBeenCalledWith('general')
  })

  it('shows error when name is empty', () => {
    render(<CreateChannelDialog {...defaultProps} />)

    fireEvent.submit(screen.getByLabelText('Channel name').closest('form')!)

    expect(screen.getByText(/Channel name must be at least/)).toBeTruthy()
  })

  it('shows error when name is too long', () => {
    render(<CreateChannelDialog {...defaultProps} />)

    fireEvent.change(screen.getByLabelText('Channel name'), { target: { value: 'a'.repeat(21) } })
    fireEvent.submit(screen.getByLabelText('Channel name').closest('form')!)

    expect(screen.getByText(/Channel name must be at most/)).toBeTruthy()
  })

  it('does not call onCreate when validation fails', () => {
    const onCreate = vi.fn()
    render(<CreateChannelDialog {...defaultProps} onCreate={onCreate} />)

    fireEvent.submit(screen.getByLabelText('Channel name').closest('form')!)

    expect(onCreate).not.toHaveBeenCalled()
  })

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn()
    render(<CreateChannelDialog {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByText('Cancel'))

    expect(onClose).toHaveBeenCalled()
  })

  it('resets state on close', () => {
    const { rerender } = render(<CreateChannelDialog {...defaultProps} />)

    fireEvent.change(screen.getByLabelText('Channel name'), { target: { value: 'test' } })
    fireEvent.click(screen.getByText('Cancel'))

    rerender(<CreateChannelDialog {...defaultProps} />)

    const input = screen.getByLabelText('Channel name') as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('shows requirement indicator', () => {
    render(<CreateChannelDialog {...defaultProps} />)

    expect(screen.getByText('Channel name between 1-20 characters')).toBeTruthy()
  })
})
