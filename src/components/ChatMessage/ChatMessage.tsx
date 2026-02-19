import { Stack, Typography } from '@mui/material'
import { SystemMessage } from '~/components'
import { SYSTEM_USER_ID } from '~/lib/ws-types'
import { formatTimestamp } from '~/utils/formatTimestamp'

interface Props {
  content: string
  username: string
  userId: number
  isOwn: boolean
  timestamp: Date | string
}

export const ChatMessage = ({
  content,
  username,
  userId,
  isOwn,
  timestamp,
}: Props) => {
  if (userId === SYSTEM_USER_ID) {
    return (
      <Stack width="100%" alignItems="center">
        <SystemMessage content={content} align="center" highlight />
      </Stack>
    )
  }

  return (
    <Stack
      direction="row"
      justifyContent={isOwn ? 'flex-end' : 'flex-start'}
    >
      <Stack
        maxWidth={{ xs: '88%', sm: '70%' }}
        p={1.5}
        sx={{
          borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          ...(isOwn
            ? {
                background: 'linear-gradient(135deg, #0891B2, #0E7490)',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(8,145,178,0.3)',
              }
            : {
                bgcolor: '#E0F7FA',
                color: '#3E2723',
                border: '1px solid #B2EBF2',
              }),
        }}
      >
        {!isOwn && (
          <Typography variant="caption" color="primary">
            {username}
          </Typography>
        )}
        <Typography variant="body1" sx={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>{content}</Typography>
        <Typography variant="caption" sx={{ color: isOwn ? 'rgba(255,255,255,0.7)' : '#795548' }}>
          {formatTimestamp(timestamp)}
        </Typography>
      </Stack>
    </Stack>
  )
}
