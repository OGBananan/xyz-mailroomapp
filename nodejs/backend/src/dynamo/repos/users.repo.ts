import { Injectable } from '@nestjs/common'
import { GetItemCommand, PutItemCommand, DeleteItemCommand, UpdateItemCommand } from 'dynamodb-toolbox'
import { UserEntity, type UserItem } from '../entities/index.js'

type UserKey    = Pick<UserItem, 'userId'>
type UserUpdate = Partial<Omit<UserItem, 'userId'>>

@Injectable()
export class UsersRepo {
  async get(key: UserKey): Promise<UserItem | null> {
    const { Item } = await UserEntity.build(GetItemCommand).key(key).send()
    return (Item as UserItem | undefined) ?? null
  }

  async put(item: UserItem): Promise<void> {
    await UserEntity.build(PutItemCommand).item(item).send()
  }

  async update(key: UserKey, updates: UserUpdate): Promise<void> {
    await UserEntity.build(UpdateItemCommand).item({ ...key, ...updates }).send()
  }

  async delete(key: UserKey): Promise<void> {
    await UserEntity.build(DeleteItemCommand).key(key).send()
  }
}
