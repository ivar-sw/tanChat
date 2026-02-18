import { z } from 'zod'

const trimmed = (min: number, max: number, label?: string) => {
  return z.string().trim().min(min, label ? `${label} must be at least ${min} characters` : undefined).max(max, label ? `${label} must be at most ${max} characters` : undefined)
}

export const usernameSchema = trimmed(3, 30, 'Username')
export const passwordSchema = trimmed(6, 64, 'Password')
export const channelNameSchema = trimmed(1, 20, 'Channel name')
export const messageContentSchema = trimmed(1, 2000, 'Message')
export const channelIdSchema = z.number().int().positive()

export const authInputSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
})

export const sendMessageInputSchema = z.object({
  channelId: channelIdSchema,
  content: messageContentSchema,
})

export const getMessagesInputSchema = z.object({
  channelId: channelIdSchema,
})

export const createChannelInputSchema = z.object({
  name: channelNameSchema,
})

export const deleteChannelInputSchema = z.object({
  channelId: channelIdSchema,
})

export const friendlyParse = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data)
  if (result.success)
    return result.data
  const message = result.error.issues.map(i => i.message).join(', ')
  throw new Error(message)
}

export const clientWsMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('channel:join'), channelId: channelIdSchema }),
  z.object({ type: z.literal('message:new'), channelId: channelIdSchema, messageId: channelIdSchema }),
  z.object({ type: z.literal('typing:start') }),
  z.object({ type: z.literal('typing:stop') }),
])
