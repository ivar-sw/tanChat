import { createClient } from '@libsql/client'

export default async function globalTeardown() {
  const url = process.env.DATABASE_URL || 'file:./.data/data.db'
  const client = createClient({ url: url.startsWith('file:') ? url : `file:${url}` })

  // Delete messages from test users
  await client.execute(`
    DELETE FROM messages WHERE user_id IN (
      SELECT id FROM users WHERE username LIKE 'user\\_%' ESCAPE '\\' OR username LIKE 'u\\_%' ESCAPE '\\'
    )
  `)

  // Delete test channels (not 'general')
  await client.execute(`
    DELETE FROM messages WHERE channel_id IN (
      SELECT id FROM channels WHERE name LIKE 'test-%' OR name LIKE 'del-%' OR name LIKE 'other-%' OR name LIKE 'shared-%' OR name LIKE 'gone-%'
    )
  `)
  await client.execute(`
    DELETE FROM channels WHERE name LIKE 'test-%' OR name LIKE 'del-%' OR name LIKE 'other-%' OR name LIKE 'shared-%' OR name LIKE 'gone-%'
  `)

  // Delete test users
  await client.execute(`DELETE FROM users WHERE username LIKE 'user\\_%' ESCAPE '\\' OR username LIKE 'u\\_%' ESCAPE '\\'`)

  client.close()
}
