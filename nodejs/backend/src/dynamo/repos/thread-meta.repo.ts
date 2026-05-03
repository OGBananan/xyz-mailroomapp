import { Injectable } from '@nestjs/common'
import { GetItemCommand, PutItemCommand, DeleteItemCommand } from 'dynamodb-toolbox'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { ThreadMetaEntity, type ThreadMetaItem } from '../entities/index.js'
import { buildUpdateExpression, type UpdateOptions } from '../update-builder.js'
import { documentClient } from '../dynamo.client.js'
import { env } from '../../config/env.js'

const TABLE = `${env.DYNAMO_TABLE_PREFIX}-thread-meta`

type ThreadMetaKey    = Pick<ThreadMetaItem, 'userId' | 'threadId'>
type ThreadMetaUpdate = Partial<Omit<ThreadMetaItem, 'userId' | 'threadId'>>

@Injectable()
export class ThreadMetaRepo {
  async get(key: ThreadMetaKey): Promise<ThreadMetaItem | null> {
    const { Item } = await ThreadMetaEntity.build(GetItemCommand).key(key).send()
    return (Item as ThreadMetaItem | undefined) ?? null
  }

  async put(item: ThreadMetaItem): Promise<void> {
    await ThreadMetaEntity.build(PutItemCommand).item(item).send()
  }

  async update(key: ThreadMetaKey, updates: ThreadMetaUpdate, opts?: UpdateOptions): Promise<void> {
    await documentClient.send(new UpdateCommand({
      TableName: TABLE,
      Key: key,
      ...buildUpdateExpression(updates as Record<string, unknown>, opts),
    }))
  }

  async delete(key: ThreadMetaKey): Promise<void> {
    await ThreadMetaEntity.build(DeleteItemCommand).key(key).send()
  }

  /**
   * Parallel individual GETs — simpler than wiring BatchGetRequest + executeBatchGet
   * for this use case (≤100 threads per board load).
   */
  async batchGet(userId: string, threadIds: string[]): Promise<Map<string, ThreadMetaItem>> {
    if (threadIds.length === 0) return new Map()

    const results = await Promise.all(
      threadIds.map(threadId =>
        ThreadMetaEntity.build(GetItemCommand)
          .key({ userId, threadId })
          .send()
          .then(r => r.Item as ThreadMetaItem | undefined)
          .catch(() => undefined),
      ),
    )

    const map = new Map<string, ThreadMetaItem>()
    for (const item of results) {
      if (item?.threadId) map.set(item.threadId, item)
    }
    return map
  }
}
