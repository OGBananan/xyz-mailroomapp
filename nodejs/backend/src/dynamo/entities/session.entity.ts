import { Table, Entity, item, string, number, type InputValue } from 'dynamodb-toolbox'
import { documentClient } from '../dynamo.client.js'
import { env } from '../../config/env.js'

export const SESSION_TABLE_NAME = 'xyz-mailroomapp-sessions'

const table = new Table({
  name:         SESSION_TABLE_NAME,
  partitionKey: { name: 'sid', type: 'string' },
  documentClient,
})

const now = () => Date.now()

export const SessionSchema = item({
  sid:       string().key(),
  userId:    string(),
  expiresAt: number(),           // unix seconds — DDB TTL attribute
  createdAt: number().optional().putDefault(now),
})

export interface SessionItem extends InputValue<typeof SessionSchema> {}

export const SessionEntity = new Entity({
  name:   'Session',
  table,
  schema: SessionSchema,
})
