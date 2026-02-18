import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { createChannelInputSchema, deleteChannelInputSchema, friendlyParse, getMessagesInputSchema, sendMessageInputSchema } from '~/lib/validation'
import { db } from '~/server/db'
import { channels, messages, users } from '~/server/db/schema'
import { authMiddleware, loggingMiddleware } from '~/server/middleware'

const ensureDefaultChannel = async () => {
  const existing = await db.select().from(channels).get()
  if (!existing) {
    await db.insert(channels).values({ name: 'general' }).onConflictDoNothing().run()
  }
}

export const getChannels = createServerFn({ method: 'GET' })
  .middleware([loggingMiddleware, authMiddleware])
  .handler(async () => {
    await ensureDefaultChannel()
    return db.select().from(channels).all()
  })

export const getMessages = createServerFn({ method: 'GET' })
  .middleware([loggingMiddleware, authMiddleware])
  .inputValidator(data => friendlyParse(getMessagesInputSchema, data))
  .handler(async ({ data }) => {
    return db
      .select({
        id: messages.id,
        content: messages.content,
        createdAt: messages.createdAt,
        username: users.username,
        userId: messages.userId,
      })
      .from(messages)
      .innerJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.channelId, data.channelId))
      .orderBy(desc(messages.createdAt))
      .limit(50)
      .all()
  })

export const sendMessage = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware, authMiddleware])
  .inputValidator(data => friendlyParse(sendMessageInputSchema, data))
  .handler(async ({ data, context }) => {
    try {
      const msg = await db
        .insert(messages)
        .values({
          content: data.content,
          userId: context.user.userId,
          channelId: data.channelId,
        })
        .returning()
        .get()

      return { ...msg, username: context.user.username }
    }
    catch {
      throw new Error('Referenced item no longer exists')
    }
  })

export const createChannel = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware, authMiddleware])
  .inputValidator(data => friendlyParse(createChannelInputSchema, data))
  .handler(async ({ data, context }) => {
    const channel = await db
      .insert(channels)
      .values({ name: data.name, createdBy: context.user.userId })
      .onConflictDoNothing()
      .returning()
      .get()

    if (!channel) {
      throw new Error('A channel with that name already exists')
    }

    return channel
  })

export const deleteChannel = createServerFn({ method: 'POST' })
  .middleware([loggingMiddleware, authMiddleware])
  .inputValidator(data => friendlyParse(deleteChannelInputSchema, data))
  .handler(async ({ data, context }) => {
    const channel = await db
      .select()
      .from(channels)
      .where(eq(channels.id, data.channelId))
      .get()

    if (!channel) {
      throw new Error('Channel not found')
    }

    if (channel.name === 'general') {
      throw new Error('The general channel cannot be deleted')
    }

    if (channel.createdBy !== context.user.userId) {
      throw new Error('Only the channel creator can delete it')
    }

    await db.delete(messages).where(eq(messages.channelId, data.channelId)).run()
    await db.delete(channels).where(eq(channels.id, data.channelId)).run()

    return { ok: true }
  })
