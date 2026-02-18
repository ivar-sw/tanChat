import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '~/components/AuthLayout/AuthLayout'
import { login } from '~/server/rpc/auth'

const LoginPage = () => (
  <AuthLayout title="Sign In" mode="login" onAuth={data => login({ data })} />
)

export const Route = createFileRoute('/login')({
  component: LoginPage,
})
