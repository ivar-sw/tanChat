import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMinDelay } from './useMinDelay'

describe('useMinDelay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('returns false when ready is false and delay has not elapsed', () => {
    const { result } = renderHook(() => useMinDelay(false, 300))
    expect(result.current).toBe(false)
  })

  it('returns false when ready is true but delay has not elapsed', () => {
    const { result } = renderHook(() => useMinDelay(true, 300))
    expect(result.current).toBe(false)
  })

  it('returns false when delay has elapsed but ready is false', () => {
    const { result } = renderHook(() => useMinDelay(false, 300))
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe(false)
  })

  it('returns true when ready is true and delay has elapsed', () => {
    const { result } = renderHook(() => useMinDelay(true, 300))
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe(true)
  })

  it('uses default delay of 500ms', () => {
    const { result } = renderHook(() => useMinDelay(true))
    act(() => vi.advanceTimersByTime(499))
    expect(result.current).toBe(false)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(true)
  })

  it('respects custom delay', () => {
    const { result } = renderHook(() => useMinDelay(true, 500))
    act(() => vi.advanceTimersByTime(499))
    expect(result.current).toBe(false)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(true)
  })

  it('returns true when ready becomes true after delay', () => {
    const { result, rerender } = renderHook(
      ({ ready }) => useMinDelay(ready, 300),
      { initialProps: { ready: false } },
    )
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe(false)

    rerender({ ready: true })
    expect(result.current).toBe(true)
  })

  it('cleans up timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { unmount } = renderHook(() => useMinDelay(true, 300))
    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })
})
