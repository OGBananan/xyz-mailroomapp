import { Injectable } from '@nestjs/common'
import { GetItemCommand, PutItemCommand, DeleteItemCommand } from 'dynamodb-toolbox'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { SyncStateEntity, type SyncStateItem, SYNC_STATE_TABLE_NAME } from '../entities/index.js'
import { buildUpdateExpression, type UpdateOptions } from '../update-builder.js'
import { documentClient } from '../dynamo.client.js'

type SyncStateKey    = Pick<SyncStateItem, 'userId'>
type SyncStateUpdate = Partial<Omit<SyncStateItem, 'userId'>>

@Injectable()
export class SyncStateRepo {
  async get(key: SyncStateKey): Promise<SyncStateItem | null> {
    const { Item } = await SyncStateEntity.build(GetItemCommand).key(key).send()
    return (Item as SyncStateItem | undefined) ?? null
  }

  async put(item: SyncStateItem): Promise<void> {
    await SyncStateEntity.build(PutItemCommand).item(item).send()
  }

  async update(key: SyncStateKey, updates: SyncStateUpdate, opts?: UpdateOptions): Promise<void> {
    await documentClient.send(new UpdateCommand({
      TableName: SYNC_STATE_TABLE_NAME,
      Key: key,
      ...buildUpdateExpression(updates as Record<string, unknown>, opts),
    }))
  }

  async delete(key: SyncStateKey): Promise<void> {
    await SyncStateEntity.build(DeleteItemCommand).key(key).send()
  }
}
