import { Injectable, Logger } from '@nestjs/common'
import { GetItemCommand, PutItemCommand, DeleteItemCommand, UpdateItemCommand } from 'dynamodb-toolbox'
import { ThreadMetaEntity, type ThreadMetaItem } from '../entities/index.js'

type ThreadMetaKey    = Pick<ThreadMetaItem, 'userId' | 'threadId'>
type ThreadMetaUpdate = Partial<Omit<ThreadMetaItem, 'userId' | 'threadId'>>

@Injectable()
export class ThreadMetaRepo {
  private readonly logger = new Logger(ThreadMetaRepo.name)

  async get(key: ThreadMetaKey): Promise<ThreadMetaItem | null> {
    const { Item } = await ThreadMetaEntity.build(GetItemCommand).key(key).send()
    return (Item as ThreadMetaItem | undefined) ?? null
  }

  async put(item: ThreadMetaItem): Promise<void> {
    await ThreadMetaEntity.build(PutItemCommand).item(item).send()
  }

  async update(key: ThreadMetaKey, updates: ThreadMetaUpdate): Promise<void> {
    await ThreadMetaEntity.build(UpdateItemCommand).item({ ...key, ...updates }).send()
  }

  async delete(key: ThreadMetaKey): Promise<void> {
    await ThreadMetaEntity.build(DeleteItemCommand).key(key).send()
  }

  async batchGet(userId: string, threadIds: string[]): Promise<Map<string, ThreadMetaItem>> {
    if (threadIds.length === 0) return new Map()

    const results = await Promise.all(
      threadIds.map(threadId =>
        ThreadMetaEntity.build(GetItemCommand)
          .key({ userId, threadId })
          .send()
          .then(r => r.Item as ThreadMetaItem | undefined)
          .catch(err => { this.logger.warn(err, `batchGet failed for ${threadId}`); return undefined }),
      ),
    )

    const map = new Map<string, ThreadMetaItem>()
    for (const item of results) {
      if (item?.threadId) map.set(item.threadId, item)
    }
    return map
  }
}
