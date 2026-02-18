import type { OnlineUser } from '~/lib/ws-types'
import { Chip, Stack } from '@mui/material'

interface Props {
  users: OnlineUser[]
  currentUserId: number
}

export const OnlineUsersBar = ({ users, currentUserId }: Props) => {
  if (users.length === 0)
    return null

  return (
    <Stack
      direction="row"
      spacing={1}
      p={1}
      sx={{ flexWrap: 'wrap', bgcolor: 'rgba(224,247,250,0.7)' }}
    >
      {users.map(user => (
        <Chip
          key={user.userId}
          label={user.username}
          size="small"
          color={user.userId === currentUserId ? 'primary' : 'default'}
          variant="outlined"
        />
      ))}
    </Stack>
  )
}
