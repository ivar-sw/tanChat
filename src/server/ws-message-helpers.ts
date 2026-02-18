import { eq } from 'drizzle-orm'
import { db } from './db'
import { messages, users } from './db/schema'

export interface BroadcastableMessage {
  id: number
  content: string
  createdAt: Date
  userId: number
  username: string
  channelId: number
}

export const loadMessageForBroadcast = async (messageId: number): Promise<BroadcastableMessage | null> => {
  const message = await db
    .select({
      id: messages.id,
      content: messages.content,
      createdAt: messages.createdAt,
      userId: messages.userId,
      username: users.username,
      channelId: messages.channelId,
    })
    .from(messages)
    .innerJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.id, messageId))
    .get()

  return message ?? null
}
