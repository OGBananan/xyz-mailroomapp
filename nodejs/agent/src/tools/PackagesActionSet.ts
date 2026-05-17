import { tool } from '@langchain/core/tools'
import type { RunnableConfig } from '@langchain/core/runnables'
import { Table, Entity, item, string, number, PutItemCommand, UpdateItemCommand } from 'dynamodb-toolbox'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { ActionSet } from '@ogbananan/agentcore'
import { documentClient } from './dynamo.client.js'

const table = new Table({
  name: 'xyz-mailroomapp-packages',
  partitionKey: { name: 'userId', type: 'string' },
  sortKey: { name: 'packageId', type: 'string' },
  documentClient,
})

const PackageSchema = item({
  userId: string().key(),
  packageId: string().key(),
  emailId: string(),
  threadId: string(),
  carrier: string().optional(),
  trackingNumber: string().optional(),
  status: string().optional().putDefault(() => 'in-transit'),
  expectedDelivery: string().optional(),
  description: string().optional(),
  createdAt: number().optional().putDefault(() => Date.now()),
  updatedAt: number().optional().putDefault(() => Date.now()).updateDefault(() => Date.now()),
})

const PackageEntity = new Entity({ name: 'Package', table, schema: PackageSchema })

const createPackage = tool(
  async (
    input: {
      emailId: string
      threadId: string
      carrier?: string
      trackingNumber?: string
      expectedDelivery?: string
      description?: string
    },
    config?: RunnableConfig,
  ) => {
    const userId = config?.configurable?.['userId'] as string | undefined
    if (!userId) return 'Error: userId missing from configurable'
    const packageId = uuid()
    await PackageEntity.build(PutItemCommand).item({ userId, packageId, ...input }).send()
    return `Package created: ${packageId}${input.trackingNumber ? ` — tracking: ${input.trackingNumber}` : ''}`
  },
  {
    name: 'create_package',
    description: 'Create a package/delivery record from a shipping or tracking email.',
    schema: z.object({
      emailId: z.string().describe('Gmail message ID'),
      threadId: z.string().describe('Gmail thread ID'),
      carrier: z.string().optional().describe('Carrier name e.g. "FedEx", "UPS", "USPS"'),
      trackingNumber: z.string().optional().describe('Tracking number if present in the email'),
      expectedDelivery: z.string().optional().describe('Expected delivery date if mentioned'),
      description: z.string().optional().describe('Brief description of what was ordered'),
    }),
  },
)

const updatePackage = tool(
  async (
    input: { packageId: string; status?: string; expectedDelivery?: string },
    config?: RunnableConfig,
  ) => {
    const userId = config?.configurable?.['userId'] as string | undefined
    if (!userId) return 'Error: userId missing from configurable'
    await PackageEntity.build(UpdateItemCommand).item({ userId, ...input }).send()
    return `Package ${input.packageId} updated`
  },
  {
    name: 'update_package',
    description: 'Update an existing package record.',
    schema: z.object({
      packageId: z.string().describe('Package ID returned by create_package'),
      status: z
        .enum(['ordered', 'in-transit', 'out-for-delivery', 'delivered', 'delayed', 'returned'])
        .optional(),
      expectedDelivery: z.string().optional(),
    }),
  },
)

export class PackagesActionSet extends ActionSet {
  readonly actions = [createPackage, updatePackage]
}
