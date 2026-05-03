import { Entity, item, string, number, type InputValue } from 'dynamodb-toolbox'
import { UsersTable } from '../tables.js'

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
  table:  UsersTable,
  schema: UserSchema,
})
