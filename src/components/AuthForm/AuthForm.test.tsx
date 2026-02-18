import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthForm } from './AuthForm'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

describe('authForm', () => {
  it('renders login mode correctly', () => {
    render(<AuthForm mode="login" onSubmit={vi.fn()} />)
    expect(screen.getByText('Sign In')).toBeTruthy()
    expect(screen.getByText('Don\'t have an account? Register')).toBeTruthy()
  })

  it('renders register mode correctly', () => {
    render(<AuthForm mode="register" onSubmit={vi.fn()} />)
    expect(screen.getByText('Create Account')).toBeTruthy()
    expect(screen.getByText('Already have an account? Sign In')).toBeTruthy()
  })

  it('shows error on failed submit', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Bad credentials'))
    render(<AuthForm mode="login" onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'alice' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } })
    fireEvent.submit(screen.getByText('Sign In').closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('Bad credentials')).toBeTruthy()
    })
  })
})
