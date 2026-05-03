import { Table, Entity, item, string, number, type InputValue } from 'dynamodb-toolbox'
import { documentClient } from '../dynamo.client.js'
import { env } from '../../config/env.js'

export const USER_TABLE_NAME = 'xyz-mailroomapp-users'

const table = new Table({
  name:         USER_TABLE_NAME,
  partitionKey: { name: 'userId', type: 'string' },
  documentClient,
})

const now = () => Date.now()

export const UserSchema = item({
  userId:    string().key(),
  email:     string(),
  name:      string(),
  createdAt: number().optional().putDefault(now),
  updatedAt: number().optional().putDefault(now).updateDefault(now),
})

export interface UserItem extends InputValue<typeof UserSchema> {}

export const UserEntity = new Entity({
  name:   'User',
  table,
  schema: UserSchema,
})
