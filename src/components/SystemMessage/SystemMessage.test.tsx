import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SystemMessage } from './SystemMessage'

describe('systemMessage', () => {
  it('renders the content text', () => {
    render(<SystemMessage content="alice has joined the chat" />)
    expect(screen.getByText('alice has joined the chat')).toBeTruthy()
  })
})
