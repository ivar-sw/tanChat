import { Typography } from '@mui/material'

interface Props {
  typingUsers: string[]
}

export const TypingIndicator = ({ typingUsers }: Props) => {
  if (typingUsers.length === 0)
    return null

  return (
    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
      {typingUsers.join(', ')}
      {' '}
      {typingUsers.length === 1 ? 'is' : 'are'}
      {' '}
      typing...
    </Typography>
  )
}
