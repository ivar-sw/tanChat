import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChatInput } from './ChatInput'

describe('chatInput', () => {
  it('renders input and submit button', () => {
    render(<ChatInput onSend={vi.fn()} />)
    expect(screen.getByPlaceholderText('Type a message...')).toBeTruthy()
  })

  it('calls onSend with trimmed text on submit', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)

    const input = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(input, { target: { value: '  hello  ' } })
    fireEvent.submit(input.closest('form')!)

    expect(onSend).toHaveBeenCalledWith('hello')
  })

  it('does not call onSend when input is empty', () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} />)

    const input = screen.getByPlaceholderText('Type a message...')
    fireEvent.submit(input.closest('form')!)

    expect(onSend).not.toHaveBeenCalled()
  })

  it('clears input after submit', async () => {
    render(<ChatInput onSend={vi.fn()} />)

    const input = screen.getByPlaceholderText('Type a message...') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'hello' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() => expect(input.value).toBe(''))
  })

  it('calls onTyping when text changes', () => {
    const onTyping = vi.fn()
    render(<ChatInput onSend={vi.fn()} onTyping={onTyping} />)

    const input = screen.getByPlaceholderText('Type a message...')
    fireEvent.change(input, { target: { value: 'h' } })

    expect(onTyping).toHaveBeenCalled()
  })
})
