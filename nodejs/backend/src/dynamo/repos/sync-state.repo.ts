import { Injectable, Logger } from '@nestjs/common'
import { GetItemCommand, PutItemCommand, DeleteItemCommand, UpdateItemCommand } from 'dynamodb-toolbox'
import { SyncStateEntity, type SyncStateItem } from '../entities/index.js'

type SyncStateKey    = Pick<SyncStateItem, 'userId'>
type SyncStateUpdate = Partial<Omit<SyncStateItem, 'userId'>>

@Injectable()
export class SyncStateRepo {
  private readonly logger = new Logger(SyncStateRepo.name)

  async get(key: SyncStateKey): Promise<SyncStateItem | null> {
    const { Item } = await SyncStateEntity.build(GetItemCommand).key(key).send()
    return (Item as SyncStateItem | undefined) ?? null
  }

  async put(item: SyncStateItem): Promise<void> {
    await SyncStateEntity.build(PutItemCommand).item(item).send()
  }

  async update(key: SyncStateKey, updates: SyncStateUpdate): Promise<void> {
    await SyncStateEntity.build(UpdateItemCommand).item({ ...key, ...updates }).send()
  }

  async delete(key: SyncStateKey): Promise<void> {
    await SyncStateEntity.build(DeleteItemCommand).key(key).send()
  }

  /** Conditional update: status → 'syncing' only if currently absent or 'idle'. */
  async acquireLock(userId: string): Promise<boolean> {
    try {
      await SyncStateEntity.build(UpdateItemCommand)
        .item({ userId, status: 'syncing' })
        .options({ condition: { or: [{ attr: 'status', exists: false }, { attr: 'status', eq: 'idle' }] } })
        .send()
      return true
    } catch (err) {
      this.logger.debug(err, `sync lock already held for ${userId}`)
      return false
    }
  }
}
