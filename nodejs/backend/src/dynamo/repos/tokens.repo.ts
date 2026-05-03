import { Injectable } from '@nestjs/common'
import { GetItemCommand, PutItemCommand, DeleteItemCommand, ScanCommand } from 'dynamodb-toolbox'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { OAuthTokenEntity, type TokenItem } from '../entities/index.js'
import { OAuthTokensTable } from '../tables.js'
import { buildUpdateExpression, type UpdateOptions } from '../update-builder.js'
import { documentClient } from '../dynamo.client.js'
import { env } from '../../config/env.js'

const TABLE = `${env.DYNAMO_TABLE_PREFIX}-oauth-tokens`

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
      TableName: TABLE,
      Key: key,
      ...buildUpdateExpression(updates as Record<string, unknown>, opts),
    }))
  }

  async delete(key: TokenKey): Promise<void> {
    await OAuthTokenEntity.build(DeleteItemCommand).key(key).send()
  }

  /** Scan only userId — used by cron to enumerate connected users. */
  async scanUserIds(): Promise<string[]> {
    const { Items } = await OAuthTokensTable.build(ScanCommand)
      .options({ attributes: ['userId'] })
      .send()
    return (Items ?? [])
      .map(i => (i as { userId?: string }).userId)
      .filter((id): id is string => Boolean(id))
  }
}
