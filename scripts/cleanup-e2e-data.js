import { createClient } from '@libsql/client'

async function main() {
  const rawUrl = process.env.DATABASE_URL || 'file:./.data/data.db'
  const url = rawUrl.startsWith('file:') || rawUrl.includes('://') ? rawUrl : `file:${rawUrl}`
  const client = createClient({ url })

  await client.execute(`
    DELETE FROM messages WHERE user_id IN (
      SELECT id FROM users WHERE username LIKE 'user\\_%' ESCAPE '\\' OR username LIKE 'u\\_%' ESCAPE '\\'
    )
  `)

  await client.execute(`
    DELETE FROM messages WHERE channel_id IN (
      SELECT id FROM channels WHERE name LIKE 'test-%' OR name LIKE 'del-%' OR name LIKE 'other-%' OR name LIKE 'shared-%' OR name LIKE 'gone-%'
    )
  `)

  await client.execute(`
    DELETE FROM channels WHERE name LIKE 'test-%' OR name LIKE 'del-%' OR name LIKE 'other-%' OR name LIKE 'shared-%' OR name LIKE 'gone-%'
  `)

  await client.execute(`
    DELETE FROM users WHERE username LIKE 'user\\_%' ESCAPE '\\' OR username LIKE 'u\\_%' ESCAPE '\\'
  `)

  client.close()
  console.log('E2E-like test data cleanup complete')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
