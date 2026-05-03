import { Table, Entity, item, string, number, any, type InputValue } from 'dynamodb-toolbox'
import { documentClient } from '../dynamo.client.js'
import { env } from '../../config/env.js'

export const AGENT_RUN_TABLE_NAME = 'xyz-mailroomapp-agent-runs'

const table = new Table({
  name: AGENT_RUN_TABLE_NAME,
  partitionKey: { name: 'userId', type: 'string' },
  sortKey: { name: 'runId', type: 'string' },
  documentClient,
})

const now = () => Date.now()

export const AgentRunSchema = item({
  userId: string().key(),
  runId: string().key(),
  action: string(),
  inputDigest: string(),
  output: any().optional(),
  status: string(),
  startedAt: number().optional().putDefault(now),
  completedAt: number().optional(),
  error: string().optional(),
  ttl: number(),            // unix seconds, ~30d — DDB TTL
})

export interface AgentRunItem extends InputValue<typeof AgentRunSchema> { }

export const AgentRunEntity = new Entity({
  name: 'AgentRun',
  table,
  schema: AgentRunSchema,
})
