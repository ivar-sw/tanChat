import type { Channel } from '~/lib/ws-types'
import {
  Button,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { ChannelList, ConfirmDialog, CreateChannelForm } from '~/components'

interface Props {
  channels: Channel[]
  currentChannelId: number | null
  onSelectChannel: (id: number) => void
  onCreateChannel: (name: string) => void
  onDeleteChannel?: (channelId: number) => void
  onLogout: () => void
  channelCounts?: Record<number, number>
  currentUserId?: number
}

export const ChatSidebar = ({
  channels,
  currentChannelId,
  onSelectChannel,
  onCreateChannel,
  onDeleteChannel,
  onLogout,
  channelCounts = {},
  currentUserId,
}: Props) => {
  const [deleteTarget, setDeleteTarget] = useState<Channel | null>(null)

  return (
    <Stack width={240} height="100%" borderRight={1} borderColor="divider" sx={{ background: 'linear-gradient(180deg, #F5E6D0, #FAEBD7, #F5E6D0)', boxShadow: '2px 0 8px rgba(0,0,0,0.08)' }}>
      <Stack direction="row" alignItems="center" spacing={1} p={2} sx={{ background: 'linear-gradient(90deg, #0891B2, #22D3EE)', color: '#FFFFFF' }}>
        <img src="/palm.png" alt="" width={28} height={28} style={{ borderRadius: '50%' }} />
        <Typography variant="h6" sx={{ color: '#FFFFFF' }}>TanChat</Typography>
      </Stack>
      <Divider />
      <ChannelList
        channels={channels}
        currentChannelId={currentChannelId}
        onSelectChannel={onSelectChannel}
        onDeleteChannel={setDeleteTarget}
        channelCounts={channelCounts}
        currentUserId={currentUserId}
      />
      <CreateChannelForm onCreate={onCreateChannel} />
      <Divider />
      <Stack p={1}>
        <Button variant="text" color="inherit" onClick={onLogout}>
          Log out
        </Button>
      </Stack>
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete channel"
        description={`Are you sure you want to delete "#${deleteTarget?.name}"? All messages will be lost.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget && onDeleteChannel) {
            onDeleteChannel(deleteTarget.id)
          }
          setDeleteTarget(null)
        }}
      />
    </Stack>
  )
}
