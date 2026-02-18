import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MobileAppBar } from './MobileAppBar'

describe('mobileAppBar', () => {
  it('renders channel name with hash', () => {
    render(<MobileAppBar channelName="general" onMenuOpen={vi.fn()} />)
    expect(screen.getByText('#general')).toBeTruthy()
  })

  it('renders fallback when no channel', () => {
    render(<MobileAppBar channelName={null} onMenuOpen={vi.fn()} />)
    expect(screen.getByText('Chat')).toBeTruthy()
  })

  it('calls onMenuOpen when menu button is clicked', () => {
    const onMenuOpen = vi.fn()
    render(<MobileAppBar channelName="general" onMenuOpen={onMenuOpen} />)
    fireEvent.click(screen.getByLabelText('menu'))
    expect(onMenuOpen).toHaveBeenCalledOnce()
  })
})
