import { Box, Stack } from '@mui/material'
import { SystemMessage } from '~/components/SystemMessage/SystemMessage'

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
          <SystemMessage
            align="left"
            content={req.label}
            sx={{
              color: req.isMet ? 'success.main' : 'text.secondary',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '0.875rem',
            }}
          />
        </Stack>
      ))}
    </Stack>
  )
}
