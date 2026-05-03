import { Entity, item, string, number, type InputValue } from 'dynamodb-toolbox'
import { SyncStateTable } from '../tables.js'

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
  table:  SyncStateTable,
  schema: SyncStateSchema,
})
