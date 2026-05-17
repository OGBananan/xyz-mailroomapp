import { AgentType, extractLastAIContent } from '@ogbananan/agentcore'
import type { AgentDefinition } from '@ogbananan/agentcore'
import { HumanMessage } from '@langchain/core/messages'
import { checkpointer, buildRegistry } from './registry.js'
import type { DraftAgentInput } from '../types/index.js'

export const draftDefinition: AgentDefinition = {
  type: AgentType.DEEP,
  name: 'draft',
  description: 'Autonomously writes and saves a reply draft for a given email thread.',
  model: {
    model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    temperature: 0.4,
  },
  systemPrompt: `You are an autonomous draft-writing agent.

When given a card (email thread needing a reply), you must:

1. Call get_thread with the threadId to retrieve the full email content.
2. Write a reply draft:
   - Concise and direct — no filler phrases like "I hope this email finds you well"
   - Natural and warm, not robotic
   - 2–5 sentences unless significantly more is needed
   - No subject line — body text only
3. Call create_draft to save the draft to Gmail.
4. Call update_card to record that the draft is ready.

If the user provided additional context, incorporate it into the draft naturally.`,
  tools: [
    'get_card',
    'update_card',
    'get_thread',
    'create_draft',
  ],
}

export async function runDraftAgent(input: DraftAgentInput, threadId: string, userId: string, accessToken: string): Promise<string> {
  const registry = await buildRegistry(accessToken)
  registry.registerAgent('draft', draftDefinition)
  const agent = registry.build(draftDefinition, checkpointer)

  const humanMessage = [
    `Write a reply draft for this email thread.`,
    `Thread ID: ${input.email.threadId}`,
    `From: ${input.email.from.name} <${input.email.from.email}>`,
    `Subject: ${input.email.subject}`,
    input.userContext ? `\nAdditional context from the user: ${input.userContext}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const result = await agent.invoke(
    { messages: [new HumanMessage(humanMessage)] },
    threadId,
    { userId, accessToken },
  )

  return extractLastAIContent(result.messages)
}
