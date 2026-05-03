import { Table, Entity, item, string, number, type InputValue } from 'dynamodb-toolbox'
import { documentClient } from '../dynamo.client.js'
import { env } from '../../config/env.js'

export const OAUTH_TOKEN_TABLE_NAME = 'xyz-mailroomapp-oauth-tokens'

const table = new Table({
  name:         OAUTH_TOKEN_TABLE_NAME,
  partitionKey: { name: 'userId', type: 'string' },
  documentClient,
})

const now = () => Date.now()

export const TokenSchema = item({
  userId:                string().key(),
  encryptedAccessToken:  string(),
  encryptedRefreshToken: string(),
  scope:                 string().optional(),
  expiresAt:             number(),
  createdAt:             number().optional().putDefault(now),
  updatedAt:             number().optional().putDefault(now).updateDefault(now),
})

export interface TokenItem extends InputValue<typeof TokenSchema> {}

export const OAuthTokenEntity = new Entity({
  name:   'OAuthToken',
  table,
  schema: TokenSchema,
})
