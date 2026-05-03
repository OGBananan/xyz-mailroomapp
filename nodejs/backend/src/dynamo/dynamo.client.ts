import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { env } from '../config/env.js'

const raw = new DynamoDBClient({
  region: env.AWS_REGION,
  ...(env.DYNAMO_ENDPOINT ? { endpoint: env.DYNAMO_ENDPOINT } : {}),
})

export const documentClient = DynamoDBDocumentClient.from(raw, {
  marshallOptions: { removeUndefinedValues: true },
})
