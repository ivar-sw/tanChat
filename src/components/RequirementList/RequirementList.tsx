import { Box, Stack, Typography } from '@mui/material'

export interface Requirement {
  label: string
  isMet: boolean
}

interface Props {
  requirements: Requirement[]
}

export const RequirementList = ({ requirements }: Props) => {
  return (
    <Stack spacing={0.5}>
      {requirements.map(req => (
        <Stack key={req.label} direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: req.isMet ? 'success.main' : 'text.disabled',
              flexShrink: 0,
            }}
          />
          <Typography variant="body2" color={req.isMet ? 'success.main' : 'text.secondary'}>
            {req.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}
