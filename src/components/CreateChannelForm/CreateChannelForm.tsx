import { Button, Divider, Stack } from '@mui/material'
import { useState } from 'react'
import { CreateChannelDialog } from '~/components'

interface Props {
  onCreate: (name: string) => void
}

export const CreateChannelForm = ({ onCreate }: Props) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Divider />
      <Stack p={1}>
        <Button
          color="primary"
          size="medium"
          onClick={() => setOpen(true)}
        >
          + New channel
        </Button>
      </Stack>
      <CreateChannelDialog
        open={open}
        onClose={() => setOpen(false)}
        onCreate={onCreate}
      />
    </>
  )
}
