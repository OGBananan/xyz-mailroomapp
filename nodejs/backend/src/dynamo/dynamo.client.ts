import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { env } from '../config/env.js'

/**
 * Credentials are never passed explicitly.
 * The SDK resolves them automatically via the default provider chain:
 *
 *   Production  → ECS task role / EC2 instance profile / Lambda exec role (IMDSv2)
 *   Local dev   → ~/.aws/credentials  (AWS_PROFILE) or env vars
 *   CI          → AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY env vars
 *
 * For DynamoDB Local, set the standard SDK env var:
 *   AWS_ENDPOINT_URL_DYNAMODB=http://localhost:8000
 * The SDK picks it up automatically — no code change needed between environments.
 */
const client = new DynamoDBClient({ region: env.AWS_REGION })

export const documentClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})
