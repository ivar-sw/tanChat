import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AuthLayout } from './AuthLayout'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

describe('authLayout', () => {
  it('renders title', () => {
    render(<AuthLayout title="Sign In" mode="login" onAuth={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeTruthy()
  })

  it('renders auth form with correct mode', () => {
    render(<AuthLayout title="Create Account" mode="register" onAuth={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeTruthy()
  })

  it('renders TanChat logo', () => {
    render(<AuthLayout title="Sign In" mode="login" onAuth={vi.fn()} />)
    expect(screen.getByText('TanChat')).toBeTruthy()
  })
})
