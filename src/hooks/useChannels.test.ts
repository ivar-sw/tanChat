import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createChannel, deleteChannel, getChannels } from '~/server/rpc/chat'
import { useChatStore } from '~/stores/chat'
import { useChannels } from './useChannels'

vi.mock('~/server/rpc/chat', () => ({
  getChannels: vi.fn(),
  createChannel: vi.fn(),
  deleteChannel: vi.fn(),
}))

const mockGetChannels = vi.mocked(getChannels)
const mockCreateChannel = vi.mocked(createChannel)
const mockDeleteChannel = vi.mocked(deleteChannel)

describe('useChannels', () => {
  beforeEach(() => {
    useChatStore.setState({ channels: [] })
    vi.clearAllMocks()
  })

  it('fetches channels on mount and stores them', async () => {
    const fetched = [{ id: 1, name: 'general', createdBy: null, createdAt: new Date() }]
    mockGetChannels.mockResolvedValue(fetched)

    renderHook(() => useChannels())

    await waitFor(() => {
      expect(useChatStore.getState().channels).toEqual(fetched)
    })
  })

  it('returns channels from store', async () => {
    mockGetChannels.mockResolvedValue([])
    useChatStore.setState({ channels: [{ id: 1, name: 'general', createdBy: null }] })

    const { result } = renderHook(() => useChannels())

    expect(result.current.channels).toEqual([{ id: 1, name: 'general', createdBy: null }])
  })

  it('create() calls RPC and adds to store', async () => {
    const channel = { id: 2, name: 'random', createdBy: 1, createdAt: new Date() }
    mockGetChannels.mockResolvedValue([])
    mockCreateChannel.mockResolvedValue(channel)

    const { result } = renderHook(() => useChannels())

    const created = await result.current.create('random')

    expect(mockCreateChannel).toHaveBeenCalledWith({ data: { name: 'random' } })
    expect(created).toEqual(channel)
    expect(useChatStore.getState().channels).toContainEqual(channel)
  })

  it('remove() calls RPC and removes channel from store', async () => {
    mockGetChannels.mockResolvedValue([])
    mockDeleteChannel.mockResolvedValue({ ok: true })
    useChatStore.setState({ channels: [{ id: 1, name: 'general', createdBy: null }, { id: 2, name: 'random', createdBy: 1 }] })

    const { result } = renderHook(() => useChannels())

    await result.current.remove(2)

    expect(mockDeleteChannel).toHaveBeenCalledWith({ data: { channelId: 2 } })
    expect(useChatStore.getState().channels).toEqual([{ id: 1, name: 'general', createdBy: null }])
  })
})
