import { Box, keyframes, Stack } from '@mui/material'

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

export const PalmSpinner = () => (
  <Stack alignItems="center" spacing={1}>
    <Box
      component="img"
      src="/palm.png"
      alt=""
      sx={{ width: 48, height: 48, borderRadius: '50%', animation: `${spin} 2s linear infinite` }}
    />
  </Stack>
)
