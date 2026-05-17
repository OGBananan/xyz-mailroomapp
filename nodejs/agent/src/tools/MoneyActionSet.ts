import { tool } from '@langchain/core/tools'
import type { RunnableConfig } from '@langchain/core/runnables'
import { Table, Entity, item, string, number, PutItemCommand, UpdateItemCommand } from 'dynamodb-toolbox'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { ActionSet } from '@ogbananan/agentcore'
import { documentClient } from './dynamo.client.js'

const table = new Table({
  name: 'xyz-mailroomapp-money',
  partitionKey: { name: 'userId', type: 'string' },
  sortKey: { name: 'moneyId', type: 'string' },
  documentClient,
})

const MoneySchema = item({
  userId: string().key(),
  moneyId: string().key(),
  type: string(),
  emailId: string(),
  threadId: string(),
  amount: string().optional(),
  currency: string().optional(),
  counterparty: string().optional(),
  status: string().optional().putDefault(() => 'pending'),
  createdAt: number().optional().putDefault(() => Date.now()),
  updatedAt: number().optional().putDefault(() => Date.now()).updateDefault(() => Date.now()),
})

const MoneyEntity = new Entity({ name: 'Money', table, schema: MoneySchema })

const createMoneyItem = tool(
  async (
    input: {
      type: string
      emailId: string
      threadId: string
      amount?: string
      currency?: string
      counterparty?: string
    },
    config?: RunnableConfig,
  ) => {
    const userId = config?.configurable?.['userId'] as string | undefined
    if (!userId) return 'Error: userId missing from configurable'
    const moneyId = uuid()
    await MoneyEntity.build(PutItemCommand).item({ userId, moneyId, ...input }).send()
    return `Money item created: ${moneyId} — ${input.type}${input.amount ? ` ${input.amount} ${input.currency ?? ''}` : ''}`
  },
  {
    name: 'create_money_item',
    description: 'Create a money record from an invoice, payment, receipt, or financial email.',
    schema: z.object({
      type: z
        .enum(['invoice', 'payment', 'receipt', 'refund', 'subscription', 'other'])
        .describe('Type of financial email'),
      emailId: z.string().describe('Gmail message ID'),
      threadId: z.string().describe('Gmail thread ID'),
      amount: z.string().optional().describe('Amount as a string e.g. "49.99"'),
      currency: z.string().optional().describe('Currency code e.g. "USD"'),
      counterparty: z.string().optional().describe('Name of the company or person'),
    }),
  },
)

const updateMoneyItem = tool(
  async (
    input: { moneyId: string; status?: string; amount?: string; currency?: string },
    config?: RunnableConfig,
  ) => {
    const userId = config?.configurable?.['userId'] as string | undefined
    if (!userId) return 'Error: userId missing from configurable'
    await MoneyEntity.build(UpdateItemCommand).item({ userId, ...input }).send()
    return `Money item ${input.moneyId} updated`
  },
  {
    name: 'update_money_item',
    description: 'Update an existing money record.',
    schema: z.object({
      moneyId: z.string().describe('Money item ID returned by create_money_item'),
      status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
      amount: z.string().optional(),
      currency: z.string().optional(),
    }),
  },
)

export class MoneyActionSet extends ActionSet {
  readonly actions = [createMoneyItem, updateMoneyItem]
}
