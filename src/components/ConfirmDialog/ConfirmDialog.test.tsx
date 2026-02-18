import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'

const defaultProps = {
  open: true,
  title: 'Delete channel',
  description: 'Are you sure you want to delete this channel?',
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
}

describe('confirmDialog', () => {
  it('renders title, description and buttons when open', () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText('Delete channel')).toBeTruthy()
    expect(screen.getByText('Are you sure you want to delete this channel?')).toBeTruthy()
    expect(screen.getByText('Cancel')).toBeTruthy()
    expect(screen.getByText('Delete')).toBeTruthy()
  })

  it('calls onCancel when cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />)

    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onConfirm when delete is clicked', () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)

    fireEvent.click(screen.getByText('Delete'))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('does not render content when closed', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />)

    expect(screen.queryByText('Delete channel')).toBeNull()
  })
})
