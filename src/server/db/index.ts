import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

const getDbUrl = () => {
  const url = process.env.DATABASE_URL || './.data/data.db'
  if (url.includes('://') || url.startsWith('file:'))
    return url
  return `file:${url}`
}

const client = createClient({
  url: getDbUrl(),
})

export const db = drizzle(client, { schema })
