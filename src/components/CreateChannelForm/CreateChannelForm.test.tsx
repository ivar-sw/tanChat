import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CreateChannelForm } from './CreateChannelForm'

const openDialog = () => {
  fireEvent.click(screen.getByText('+ New channel'))
}

describe('createChannelForm', () => {
  it('renders the new channel button', () => {
    render(<CreateChannelForm onCreate={vi.fn()} />)
    expect(screen.getByText('+ New channel')).toBeTruthy()
  })

  it('opens dialog when button is clicked', () => {
    render(<CreateChannelForm onCreate={vi.fn()} />)
    openDialog()
    expect(screen.getByText('Create channel')).toBeTruthy()
    expect(screen.getByLabelText('Channel name')).toBeTruthy()
  })

  it('calls onCreate on valid submit', async () => {
    const onCreate = vi.fn()
    render(<CreateChannelForm onCreate={onCreate} />)
    openDialog()

    fireEvent.change(screen.getByLabelText('Channel name'), { target: { value: 'general' } })
    fireEvent.submit(screen.getByLabelText('Channel name').closest('form')!)

    expect(onCreate).toHaveBeenCalledWith('general')
  })

  it('shows error when name is empty', () => {
    render(<CreateChannelForm onCreate={vi.fn()} />)
    openDialog()

    fireEvent.submit(screen.getByLabelText('Channel name').closest('form')!)

    expect(screen.getByText(/Channel name must be at least/)).toBeTruthy()
  })

  it('resets state on cancel', () => {
    render(<CreateChannelForm onCreate={vi.fn()} />)
    openDialog()

    const input = screen.getByLabelText('Channel name') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.click(screen.getByText('Cancel'))

    openDialog()
    const freshInput = screen.getByLabelText('Channel name') as HTMLInputElement
    expect(freshInput.value).toBe('')
  })
})
