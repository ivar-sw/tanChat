import type { Channel } from '~/lib/ws-types'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'

interface Props {
  channels: Channel[]
  currentChannelId: number | null
  onSelectChannel: (id: number) => void
  onDeleteChannel: (channel: Channel) => void
  channelCounts: Record<number, number>
  currentUserId?: number
}

export const ChannelList = ({
  channels,
  currentChannelId,
  onSelectChannel,
  onDeleteChannel,
  channelCounts,
  currentUserId,
}: Props) => {
  return (
    <List sx={{ flex: 1, overflow: 'auto' }}>
      {channels.map((channel) => {
        const canDelete = currentUserId != null && channel.createdBy === currentUserId && channel.name !== 'general'
        return (
          <ListItemButton
            key={channel.id}
            selected={channel.id === currentChannelId}
            onClick={() => onSelectChannel(channel.id)}
            sx={{
              '@media (hover: hover)': {
                '& .delete-btn': { opacity: 0 },
                '&:hover .delete-btn': { opacity: 1 },
              },
            }}
          >
            {channelCounts[channel.id]
              ? (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontSize: '0.7rem', flexShrink: 0, mr: 1, minWidth: 12, textAlign: 'center' }}
                  >
                    {channelCounts[channel.id]}
                  </Typography>
                )
              : (
                  <Typography component="span" sx={{ minWidth: 12, mr: 1, flexShrink: 0 }} />
                )}
            <ListItemText
              primary={channel.name}
              primaryTypographyProps={{ noWrap: true }}
              sx={{ minWidth: 0 }}
            />
            {canDelete && (
              <IconButton
                className="delete-btn"
                size="small"
                edge="end"
                aria-label="delete channel"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteChannel(channel)
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </ListItemButton>
        )
      })}
    </List>
  )
}
