import { Injectable } from '@nestjs/common'
import { GetItemCommand, PutItemCommand, DeleteItemCommand } from 'dynamodb-toolbox'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { UserEntity, type UserItem, USER_TABLE_NAME } from '../entities/index.js'
import { buildUpdateExpression, type UpdateOptions } from '../update-builder.js'
import { documentClient } from '../dynamo.client.js'

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

  async update(key: UserKey, updates: UserUpdate, opts?: UpdateOptions): Promise<void> {
    await documentClient.send(new UpdateCommand({
      TableName: USER_TABLE_NAME,
      Key: key,
      ...buildUpdateExpression(updates as Record<string, unknown>, opts),
    }))
  }

  async delete(key: UserKey): Promise<void> {
    await UserEntity.build(DeleteItemCommand).key(key).send()
  }
}
