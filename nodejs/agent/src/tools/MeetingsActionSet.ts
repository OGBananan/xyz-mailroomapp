import { tool } from '@langchain/core/tools'
import type { RunnableConfig } from '@langchain/core/runnables'
import { Table, Entity, item, string, number, PutItemCommand, UpdateItemCommand } from 'dynamodb-toolbox'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { ActionSet } from '@ogbananan/agentcore'
import { documentClient } from './dynamo.client.js'

const table = new Table({
  name: 'xyz-mailroomapp-meetings',
  partitionKey: { name: 'userId', type: 'string' },
  sortKey: { name: 'meetingId', type: 'string' },
  documentClient,
})

const MeetingSchema = item({
  userId: string().key(),
  meetingId: string().key(),
  title: string(),
  emailId: string(),
  threadId: string(),
  date: string().optional(),
  attendees: string().optional(),
  status: string().optional().putDefault(() => 'pending'),
  createdAt: number().optional().putDefault(() => Date.now()),
  updatedAt: number().optional().putDefault(() => Date.now()).updateDefault(() => Date.now()),
})

const MeetingEntity = new Entity({ name: 'Meeting', table, schema: MeetingSchema })

const createMeeting = tool(
  async (
    input: { title: string; emailId: string; threadId: string; date?: string; attendees?: string },
    config?: RunnableConfig,
  ) => {
    const userId = config?.configurable?.['userId'] as string | undefined
    if (!userId) return 'Error: userId missing from configurable'
    const meetingId = uuid()
    await MeetingEntity.build(PutItemCommand).item({ userId, meetingId, ...input }).send()
    return `Meeting created: ${meetingId} — "${input.title}"`
  },
  {
    name: 'create_meeting',
    description: 'Create a meeting record from a meeting invitation or scheduling email.',
    schema: z.object({
      title: z.string().describe('Meeting title or subject line'),
      emailId: z.string().describe('Gmail message ID'),
      threadId: z.string().describe('Gmail thread ID'),
      date: z.string().optional().describe('Meeting date/time if mentioned in the email'),
      attendees: z
        .string()
        .optional()
        .describe('Comma-separated attendee email addresses if mentioned'),
    }),
  },
)

const updateMeeting = tool(
  async (
    input: { meetingId: string; date?: string; attendees?: string; status?: string },
    config?: RunnableConfig,
  ) => {
    const userId = config?.configurable?.['userId'] as string | undefined
    if (!userId) return 'Error: userId missing from configurable'
    await MeetingEntity.build(UpdateItemCommand).item({ userId, ...input }).send()
    return `Meeting ${input.meetingId} updated`
  },
  {
    name: 'update_meeting',
    description: 'Update an existing meeting record.',
    schema: z.object({
      meetingId: z.string().describe('Meeting ID returned by create_meeting'),
      date: z.string().optional(),
      attendees: z.string().optional(),
      status: z.enum(['pending', 'accepted', 'declined', 'cancelled']).optional(),
    }),
  },
)

export class MeetingsActionSet extends ActionSet {
  readonly actions = [createMeeting, updateMeeting]
}
