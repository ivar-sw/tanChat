import { describe, expect, it } from 'vitest'
import { formatTimestamp } from './formatTimestamp'

describe('formatTimestamp', () => {
  it('formats a Date object to a time string', () => {
    const date = new Date('2024-01-15T14:30:00Z')
    const result = formatTimestamp(date)
    // toLocaleTimeString returns a locale-dependent string, just verify it's non-empty
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('formats an ISO string to a time string', () => {
    const result = formatTimestamp('2024-01-15T14:30:00Z')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('returns consistent output for Date and equivalent string', () => {
    const date = new Date('2024-06-01T08:00:00Z')
    const dateResult = formatTimestamp(date)
    const stringResult = formatTimestamp(date.toISOString())
    expect(dateResult).toBe(stringResult)
  })
})
