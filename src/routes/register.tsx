import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '~/components/AuthLayout/AuthLayout'
import { register } from '~/server/rpc/auth'

const RegisterPage = () => (
  <AuthLayout title="Create Account" mode="register" onAuth={data => register({ data })} />
)

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})
