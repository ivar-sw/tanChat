import { Typography } from '@mui/material'

interface Props {
  content: string
}

export const SystemMessage = ({ content }: Props) => {
  return (
    <Typography
      variant="body2"
      sx={{ textAlign: 'center', color: 'text.secondary', fontStyle: 'italic' }}
    >
      {content}
    </Typography>
  )
}
