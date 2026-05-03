import { Table } from 'dynamodb-toolbox'
import { documentClient } from './dynamo.client.js'
import { env } from '../config/env.js'

const p = env.DYNAMO_TABLE_PREFIX

// Single PK tables
export const UsersTable = new Table({
  name: `${p}-users`,
  partitionKey: { name: 'userId', type: 'string' },
  documentClient,
})

export const OAuthTokensTable = new Table({
  name: `${p}-oauth-tokens`,
  partitionKey: { name: 'userId', type: 'string' },
  documentClient,
})

export const SessionsTable = new Table({
  name: `${p}-sessions`,
  partitionKey: { name: 'sid', type: 'string' },
  documentClient,
})

export const SyncStateTable = new Table({
  name: `${p}-sync-state`,
  partitionKey: { name: 'userId', type: 'string' },
  documentClient,
})

// Composite PK+SK tables
export const ThreadMetaTable = new Table({
  name: `${p}-thread-meta`,
  partitionKey: { name: 'userId', type: 'string' },
  sortKey:      { name: 'threadId', type: 'string' },
  documentClient,
})

export const AgentRunsTable = new Table({
  name: `${p}-agent-runs`,
  partitionKey: { name: 'userId', type: 'string' },
  sortKey:      { name: 'runId', type: 'string' },
  documentClient,
})
