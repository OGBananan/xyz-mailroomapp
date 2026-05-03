import { Entity, item, string, number, type InputValue } from 'dynamodb-toolbox'
import { OAuthTokensTable } from '../tables.js'

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
  table:  OAuthTokensTable,
  schema: TokenSchema,
})
