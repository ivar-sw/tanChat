import type { ChangeEvent, FormEvent } from 'react'
import { IconButton, Stack, TextField } from '@mui/material'
import { useCallback, useRef, useState } from 'react'

interface Props {
  onSend: (content: string) => Promise<void> | void
  onTyping?: () => void
  onStopTyping?: () => void
}

export const ChatInput = ({ onSend, onTyping, onStopTyping }: Props) => {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value)
      setError(null)

      if (onTyping)
        onTyping()

      if (typingTimerRef.current)
        clearTimeout(typingTimerRef.current)
      typingTimerRef.current = setTimeout(() => {
        if (onStopTyping)
          onStopTyping()
      }, 2000)
    },
    [onTyping, onStopTyping],
  )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed)
      return
    try {
      await onSend(trimmed)
      setText('')
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
    if (typingTimerRef.current)
      clearTimeout(typingTimerRef.current)
    if (onStopTyping)
      onStopTyping()
  }

  return (
    <Stack
      component="form"
      direction="row"
      spacing={1}
      onSubmit={handleSubmit}
      p={2}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Type a message..."
        value={text}
        onChange={handleChange}
        autoComplete="off"
        error={error !== null}
        helperText={error}
        FormHelperTextProps={{ sx: { fontSize: '0.85rem', fontWeight: 700 } }}
        sx={{
          '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.85)' },
          '& .MuiOutlinedInput-input::placeholder': { color: '#795548', opacity: 1 },
        }}
      />
      <IconButton type="submit" color="primary">
        ➤
      </IconButton>
    </Stack>
  )
}
