import { Injectable } from '@nestjs/common'
import { GetItemCommand, PutItemCommand, DeleteItemCommand } from 'dynamodb-toolbox'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { SessionEntity, type SessionItem } from '../entities/index.js'
import { buildUpdateExpression, type UpdateOptions } from '../update-builder.js'
import { documentClient } from '../dynamo.client.js'
import { env } from '../../config/env.js'

const TABLE = `${env.DYNAMO_TABLE_PREFIX}-sessions`

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

  async update(key: SessionKey, updates: SessionUpdate, opts?: UpdateOptions): Promise<void> {
    await documentClient.send(new UpdateCommand({
      TableName: TABLE,
      Key: key,
      ...buildUpdateExpression(updates as Record<string, unknown>, opts),
    }))
  }

  async delete(key: SessionKey): Promise<void> {
    await SessionEntity.build(DeleteItemCommand).key(key).send()
  }
}
