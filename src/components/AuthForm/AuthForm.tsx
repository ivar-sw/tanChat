import type { FormEvent } from 'react'
import { Alert, Button, Link as MuiLink, Stack, TextField } from '@mui/material'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { RequirementList } from '~/components'
import { authInputSchema } from '~/lib/validation'

interface Props {
  mode: 'login' | 'register'
  onSubmit: (data: { username: string, password: string }) => Promise<void>
}

export const AuthForm = ({ mode, onSubmit }: Props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'register') {
      const result = authInputSchema.safeParse({ username, password })
      if (!result.success) {
        setError(result.error.issues.map(i => i.message).join(', '))
        return
      }
    }

    setLoading(true)
    try {
      await onSubmit({ username, password })
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      spacing={2}
      width={320}
    >
      {error && <Alert severity="error">{error}</Alert>}
      {mode === 'register' && (
        <RequirementList
          requirements={[
            { label: 'Username between 3-30 characters', isMet: username.trim().length >= 3 && username.trim().length <= 30 },
            { label: 'Password between 6-64 characters', isMet: password.length >= 6 && password.length <= 64 },
          ]}
        />
      )}
      <TextField
        label="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        autoFocus
        autoComplete="username"
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </Button>
      <MuiLink
        component={Link}
        to={mode === 'login' ? '/register' : '/login'}
        sx={{ textAlign: 'center' }}
      >
        {mode === 'login'
          ? 'Don\'t have an account? Register'
          : 'Already have an account? Sign In'}
      </MuiLink>
    </Stack>
  )
}
