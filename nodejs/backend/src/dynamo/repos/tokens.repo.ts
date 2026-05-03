import { Injectable } from '@nestjs/common'
import { GetItemCommand, PutItemCommand, DeleteItemCommand } from 'dynamodb-toolbox'
import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { OAuthTokenEntity, type TokenItem, OAUTH_TOKEN_TABLE_NAME } from '../entities/index.js'
import { buildUpdateExpression, type UpdateOptions } from '../update-builder.js'
import { documentClient } from '../dynamo.client.js'

type TokenKey    = Pick<TokenItem, 'userId'>
type TokenUpdate = Partial<Omit<TokenItem, 'userId'>>

@Injectable()
export class TokensRepo {
  async get(key: TokenKey): Promise<TokenItem | null> {
    const { Item } = await OAuthTokenEntity.build(GetItemCommand).key(key).send()
    return (Item as TokenItem | undefined) ?? null
  }

  async put(item: TokenItem): Promise<void> {
    await OAuthTokenEntity.build(PutItemCommand).item(item).send()
  }

  async update(key: TokenKey, updates: TokenUpdate, opts?: UpdateOptions): Promise<void> {
    await documentClient.send(new UpdateCommand({
      TableName: OAUTH_TOKEN_TABLE_NAME,
      Key: key,
      ...buildUpdateExpression(updates as Record<string, unknown>, opts),
    }))
  }

  async delete(key: TokenKey): Promise<void> {
    await OAuthTokenEntity.build(DeleteItemCommand).key(key).send()
  }

  /** Scan only userId — used by cron to enumerate connected users. */
  async scanUserIds(): Promise<string[]> {
    const { Items } = await documentClient.send(new ScanCommand({
      TableName:            OAUTH_TOKEN_TABLE_NAME,
      ProjectionExpression: 'userId',
    }))
    return (Items ?? [])
      .map(i => (i as { userId?: string }).userId)
      .filter((id): id is string => Boolean(id))
  }
}
