import { Entity, item, string, number, type InputValue } from 'dynamodb-toolbox'
import { ThreadMetaTable } from '../tables.js'

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
  table:  ThreadMetaTable,
  schema: ThreadMetaSchema,
})
