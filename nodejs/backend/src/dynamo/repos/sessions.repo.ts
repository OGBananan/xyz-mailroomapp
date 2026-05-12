import { Injectable } from '@nestjs/common'
import { GetItemCommand, PutItemCommand, DeleteItemCommand, UpdateItemCommand } from 'dynamodb-toolbox'
import { SessionEntity, type SessionItem } from '../entities/index.js'

type SessionKey    = Pick<SessionItem, 'sid'>
type SessionUpdate = Partial<Omit<SessionItem, 'sid'>>

@Injectable()
export class SessionsRepo {
  async get(key: SessionKey): Promise<SessionItem | null> {
    const { Item } = await SessionEntity.build(GetItemCommand).key(key).send()
    return (Item as SessionItem | undefined) ?? null
  }

  async put(item: SessionItem): Promise<void> {
    await SessionEntity.build(PutItemCommand).item(item).send()
  }

  async update(key: SessionKey, updates: SessionUpdate): Promise<void> {
    await SessionEntity.build(UpdateItemCommand).item({ ...key, ...updates }).send()
  }

  async delete(key: SessionKey): Promise<void> {
    await SessionEntity.build(DeleteItemCommand).key(key).send()
  }
}
