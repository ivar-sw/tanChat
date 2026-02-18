import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '~/server/rpc/auth'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: '/chat' })
    }
    else {
      throw redirect({ to: '/login' })
    }
  },
})
