import { Entity, item, string, number, any, type InputValue } from 'dynamodb-toolbox'
import { AgentRunsTable } from '../tables.js'

const now = () => Date.now()

export const AgentRunSchema = item({
  userId:      string().key(),
  runId:       string().key(),
  action:      string(),
  inputDigest: string(),
  output:      any().optional(),
  status:      string(),
  startedAt:   number().optional().putDefault(now),
  completedAt: number().optional(),
  error:       string().optional(),
  ttl:         number(),            // unix seconds, ~30d — DDB TTL
})

export interface AgentRunItem extends InputValue<typeof AgentRunSchema> {}

export const AgentRunEntity = new Entity({
  name:   'AgentRun',
  table:  AgentRunsTable,
  schema: AgentRunSchema,
})
