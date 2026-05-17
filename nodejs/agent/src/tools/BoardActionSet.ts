import { tool } from '@langchain/core/tools'
import type { RunnableConfig } from '@langchain/core/runnables'
import { Table, Entity, item, string, number, GetItemCommand, PutItemCommand, UpdateItemCommand } from 'dynamodb-toolbox'
import { z } from 'zod'
import { ActionSet } from '@ogbananan/agentcore'
import { documentClient } from './dynamo.client.js'

const table = new Table({
  name: 'xyz-mailroomapp-thread-meta',
  partitionKey: { name: 'userId', type: 'string' },
  sortKey: { name: 'threadId', type: 'string' },
  documentClient,
})

const ThreadMetaSchema = item({
  userId: string().key(),
  threadId: string().key(),
  triageReason: string().optional(),
  confidence: string().optional(),
  agentRunId: string().optional(),
  lastTriagedHistoryId: string().optional(),
  updatedAt: number().optional().putDefault(() => Date.now()).updateDefault(() => Date.now()),
})

const ThreadMetaEntity = new Entity({ name: 'ThreadMeta', table, schema: ThreadMetaSchema })

const createCard = tool(
  async (
    input: { threadId: string; triageReason: string; confidence: string; agentRunId?: string },
    config?: RunnableConfig,
  ) => {
    const userId = config?.configurable?.['userId'] as string | undefined
    if (!userId) return 'Error: userId missing from configurable'
    await ThreadMetaEntity.build(PutItemCommand)
      .item({ userId, ...input, lastTriagedHistoryId: '' })
      .send()
    return `Card created for thread ${input.threadId} in triage with reason "${input.triageReason}"`
  },
  {
    name: 'create_card',
    description: 'Persist triage metadata for an email thread. Call this for every personal-reply email.',
    schema: z.object({
      threadId: z.string().describe('Gmail thread ID'),
      triageReason: z
        .enum(['personal-reply-expected', 'decision-needed', 'question-for-you'])
        .describe('Why this email needs user attention'),
      confidence: z.enum(['high', 'medium', 'low']).describe('Confidence in the triage decision'),
      agentRunId: z.string().optional().describe('Current agent run ID for tracing'),
    }),
  },
)

const getCard = tool(
  async (input: { threadId: string }, config?: RunnableConfig) => {
    const userId = config?.configurable?.['userId'] as string | undefined
    if (!userId) return 'Error: userId missing from configurable'
    const { Item } = await ThreadMetaEntity.build(GetItemCommand).key({ userId, threadId: input.threadId }).send()
    if (!Item) return `No card found for thread ${input.threadId}`
    return JSON.stringify(Item)
  },
  {
    name: 'get_card',
    description: 'Retrieve triage metadata for an email thread.',
    schema: z.object({
      threadId: z.string().describe('Gmail thread ID'),
    }),
  },
)

const updateCard = tool(
  async (
    input: { threadId: string; triageReason?: string; confidence?: string },
    config?: RunnableConfig,
  ) => {
    const userId = config?.configurable?.['userId'] as string | undefined
    if (!userId) return 'Error: userId missing from configurable'
    await ThreadMetaEntity.build(UpdateItemCommand)
      .item({ userId, threadId: input.threadId, ...input })
      .send()
    return `Card updated for thread ${input.threadId}`
  },
  {
    name: 'update_card',
    description: 'Update triage metadata for an email thread (e.g. after refining).',
    schema: z.object({
      threadId: z.string().describe('Gmail thread ID'),
      triageReason: z
        .enum(['personal-reply-expected', 'decision-needed', 'question-for-you'])
        .optional(),
      confidence: z.enum(['high', 'medium', 'low']).optional(),
    }),
  },
)

export class BoardActionSet extends ActionSet {
  readonly actions = [createCard, getCard, updateCard]
}
