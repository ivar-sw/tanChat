import type { SxProps, Theme } from '@mui/material'
import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

interface Props {
  content: string
  align?: 'left' | 'center' | 'right'
  sx?: SxProps<Theme>
  highlight?: boolean
}

export const SystemMessage = ({ content, align = 'center', sx, highlight = false }: Props) => {
  const highlightSx = highlight
    ? {
        display: 'inline-block',
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: (theme: Theme) => alpha(theme.palette.background.paper, 0.8),
      }
    : undefined

  return (
    <Box sx={{ width: '100%', textAlign: align }}>
      <Typography
        component="span"
        variant="body1"
        sx={{ color: 'warning.main', fontStyle: 'italic', fontWeight: 600, ...highlightSx, ...sx }}
      >
        {content}
      </Typography>
    </Box>
  )
}
