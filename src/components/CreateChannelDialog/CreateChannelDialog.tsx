import type { FormEvent } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { RequirementList } from '~/components'
import { channelNameSchema } from '~/lib/validation'

interface Props {
  open: boolean
  onClose: () => void
  onCreate: (name: string) => void
}

export const CreateChannelDialog = ({ open, onClose, onCreate }: Props) => {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setName('')
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const result = channelNameSchema.safeParse(name)
    if (!result.success) {
      setError(result.error.issues.map(i => i.message).join(', '))
      return
    }

    setLoading(true)
    try {
      await onCreate(result.data)
      handleClose()
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
    finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create channel</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <RequirementList
              requirements={[
                { label: 'Channel name between 1-20 characters', isMet: name.trim().length >= 1 && name.trim().length <= 20 },
              ]}
            />
            <TextField
              autoFocus
              label="Channel name"
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
