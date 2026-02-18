import { Stack, Typography } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import { AuthForm } from '~/components'

const skyToSand = 'linear-gradient(180deg, #87CEEB 0%, #B2EBF2 20%, #E0F7FA 40%, #FDF6EC 60%, #F5E6D0 80%, #E8D5B8 100%)'

interface Props {
  title: string
  mode: 'login' | 'register'
  onAuth: (data: { username: string, password: string }) => Promise<unknown>
}

export const AuthLayout = ({ title, mode, onAuth }: Props) => {
  const navigate = useNavigate()

  return (
    <Stack
      spacing={3}
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        background: skyToSand,
      }}
    >
      <Stack alignItems="center" spacing={1}>
        <img src="/palm.png" alt="" width={56} height={56} style={{ borderRadius: '50%' }} />
        <Typography variant="h5" sx={{ color: '#0E7490', fontWeight: 700 }}>TanChat</Typography>
      </Stack>

      <Stack
        spacing={3}
        alignItems="center"
        sx={{
          bgcolor: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
          p: 4,
        }}
      >
        <Typography variant="h4">{title}</Typography>
        <AuthForm
          mode={mode}
          onSubmit={async (data) => {
            await onAuth(data)
            navigate({ to: '/chat' })
          }}
        />
      </Stack>
    </Stack>
  )
}
