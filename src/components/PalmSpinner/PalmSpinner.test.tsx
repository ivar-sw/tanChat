import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PalmSpinner } from './PalmSpinner'

describe('palmSpinner', () => {
  it('renders an image', () => {
    const { container } = render(<PalmSpinner />)
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('src')).toBe('/palm.png')
  })
})
