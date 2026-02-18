import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const channels = sqliteTable('channels', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  channelId: integer('channel_id')
    .notNull()
    .references(() => channels.id),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
})
