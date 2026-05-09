import { Injectable } from '@nestjs/common'
import { GetItemCommand, PutItemCommand, DeleteItemCommand, UpdateItemCommand } from 'dynamodb-toolbox'
import { AgentRunEntity, type AgentRunItem } from '../entities/index.js'

type AgentRunKey    = Pick<AgentRunItem, 'userId' | 'runId'>
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

  async update(key: AgentRunKey, updates: AgentRunUpdate): Promise<void> {
    await AgentRunEntity.build(UpdateItemCommand).item({ ...key, ...updates }).send()
  }

  async delete(key: AgentRunKey): Promise<void> {
    await AgentRunEntity.build(DeleteItemCommand).key(key).send()
  }
}
