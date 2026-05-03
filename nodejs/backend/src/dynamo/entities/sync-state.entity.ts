import { Table, Entity, item, string, number, type InputValue } from 'dynamodb-toolbox'
import { documentClient } from '../dynamo.client.js'
import { env } from '../../config/env.js'

export const SYNC_STATE_TABLE_NAME = 'xyz-mailroomapp-sync-state'

const table = new Table({
  name:         SYNC_STATE_TABLE_NAME,
  partitionKey: { name: 'userId', type: 'string' },
  documentClient,
})

const now = () => Date.now()

export const SyncStateSchema = item({
  userId:        string().key(),
  lastHistoryId: string().optional(),
  lastSyncedAt:  number().optional(),
  status:        string(),
  updatedAt:     number().optional().putDefault(now).updateDefault(now),
})

export interface SyncStateItem extends InputValue<typeof SyncStateSchema> {}

export const SyncStateEntity = new Entity({
  name:   'SyncState',
  table,
  schema: SyncStateSchema,
})
