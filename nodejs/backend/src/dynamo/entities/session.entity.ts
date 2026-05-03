import { Entity, item, string, number, type InputValue } from 'dynamodb-toolbox'
import { SessionsTable } from '../tables.js'

const now = () => Date.now()

export const SessionSchema = item({
  sid:       string().key(),
  userId:    string(),
  expiresAt: number(),         // unix seconds — DDB TTL attribute
  createdAt: number().optional().putDefault(now),
})

export interface SessionItem extends InputValue<typeof SessionSchema> {}

export const SessionEntity = new Entity({
  name:   'Session',
  table:  SessionsTable,
  schema: SessionSchema,
})
