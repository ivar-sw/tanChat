import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RequirementList } from './RequirementList'

describe('requirementList', () => {
  it('renders all requirement labels', () => {
    render(
      <RequirementList
        requirements={[
          { label: 'At least 3 characters', isMet: false },
          { label: 'At most 30 characters', isMet: true },
        ]}
      />,
    )

    expect(screen.getByText('At least 3 characters')).toBeTruthy()
    expect(screen.getByText('At most 30 characters')).toBeTruthy()
  })

  it('renders nothing when requirements is empty', () => {
    const { container } = render(<RequirementList requirements={[]} />)

    expect(container.querySelectorAll('p')).toHaveLength(0)
  })

  it('renders a dot indicator for each requirement', () => {
    const { container } = render(
      <RequirementList
        requirements={[
          { label: 'Req A', isMet: true },
          { label: 'Req B', isMet: false },
        ]}
      />,
    )

    const dots = container.querySelectorAll('[class*="MuiBox-root"]')
    expect(dots.length).toBeGreaterThanOrEqual(2)
  })
})
