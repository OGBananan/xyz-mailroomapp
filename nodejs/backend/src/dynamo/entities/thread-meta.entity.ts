import { Table, Entity, item, string, number, type InputValue } from 'dynamodb-toolbox'
import { documentClient } from '../dynamo.client.js'
import { env } from '../../config/env.js'

export const THREAD_META_TABLE_NAME = 'xyz-mailroomapp-thread-meta'

const table = new Table({
  name:         THREAD_META_TABLE_NAME,
  partitionKey: { name: 'userId',   type: 'string' },
  sortKey:      { name: 'threadId', type: 'string' },
  documentClient,
})

const now = () => Date.now()

export const ThreadMetaSchema = item({
  userId:               string().key(),
  threadId:             string().key(),
  triageReason:         string(),
  confidence:           string(),
  agentRunId:           string(),
  lastTriagedHistoryId: string(),
  updatedAt:            number().optional().putDefault(now).updateDefault(now),
})

export interface ThreadMetaItem extends InputValue<typeof ThreadMetaSchema> {}

export const ThreadMetaEntity = new Entity({
  name:   'ThreadMeta',
  table,
  schema: ThreadMetaSchema,
})
