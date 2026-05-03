import { Injectable } from '@nestjs/common'
import { GetItemCommand, PutItemCommand, DeleteItemCommand } from 'dynamodb-toolbox'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { AgentRunEntity, type AgentRunItem, AGENT_RUN_TABLE_NAME } from '../entities/index.js'
import { buildUpdateExpression, type UpdateOptions } from '../update-builder.js'
import { documentClient } from '../dynamo.client.js'

type AgentRunKey = Pick<AgentRunItem, 'userId' | 'runId'>
type AgentRunUpdate = Partial<Omit<AgentRunItem, 'userId' | 'runId'>>

@Injectable()
export class AgentRunsRepo {
  async get(key: AgentRunKey): Promise<AgentRunItem | null> {
    const { Item } = await AgentRunEntity.build(GetItemCommand).key(key).send()
    return (Item as AgentRunItem | undefined) ?? null
  }

  async put(item: AgentRunItem): Promise<void> {
    await AgentRunEntity.build(PutItemCommand).item(item).send()
  }

  async update(key: AgentRunKey, updates: AgentRunUpdate, opts?: UpdateOptions): Promise<void> {
    await documentClient.send(new UpdateCommand({
      TableName: AGENT_RUN_TABLE_NAME,
      Key: key,
      ...buildUpdateExpression(updates as Record<string, unknown>, opts),
    }))
  }

  async delete(key: AgentRunKey): Promise<void> {
    await AgentRunEntity.build(DeleteItemCommand).key(key).send()
  }
}
