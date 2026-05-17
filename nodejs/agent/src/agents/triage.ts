import { AgentType, extractLastAIContent } from '@ogbananan/agentcore'
import type { AgentDefinition } from '@ogbananan/agentcore'
import { HumanMessage } from '@langchain/core/messages'
import { checkpointer, buildRegistry } from './registry.js'
import type { TriageAgentInput } from '../types/index.js'

export const triageDefinition: AgentDefinition = {
  type: AgentType.DEEP,
  name: 'triage',
  description: 'Autonomously triages inbox emails — categorises each and calls the right tools to label and persist.',
  model: {
    model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    temperature: 0,
  },
  systemPrompt: `You are an autonomous inbox triage agent. You will receive a list of emails to process.

For EACH email you must perform the following steps in order:

1. Decide its category:
   - **personal-reply**: A real person wrote this and expects a response. Includes direct questions, collaboration requests, or any human-to-human communication.
   - **meeting**: A meeting invitation, calendar request, or scheduling email.
   - **money**: An invoice, payment confirmation, receipt, subscription charge, or any financial notification.
   - **package**: A shipping notification, order confirmation, tracking update, or delivery alert.
   - **noise**: Newsletters, automated alerts, marketing emails, social notifications, FYIs, or anything that does not require action.

2. Call the matching tool for that email:
   - personal-reply → call create_card (with triageReason and confidence)
   - meeting → call create_meeting
   - money → call create_money_item
   - package → call create_package
   - noise → no record needed

3. Apply a Gmail label by calling label_thread:
   - personal-reply → label: "triage/needs-you"
   - all others (meeting, money, package, noise) → label: "triage/hidden"

Rules:
- Process ALL emails before finishing. Do not stop early.
- Call exactly one categorisation tool per email (or none for noise).
- Always call label_thread for every email regardless of category.
- Use the Gmail thread ID (not message ID) when calling label_thread.`,
  tools: [
    'create_card',
    'get_card',
    'update_card',
    'create_meeting',
    'update_meeting',
    'create_money_item',
    'update_money_item',
    'create_package',
    'update_package',
    'label_thread',
  ],
}

export async function runTriageAgent(input: TriageAgentInput, threadId: string, userId: string, accessToken: string): Promise<string> {
  const registry = await buildRegistry(accessToken)
  registry.registerAgent('triage', triageDefinition)
  const agent = registry.build(triageDefinition, checkpointer)

  const emailsText = input.emails
    .map(
      (e) =>
        `Thread ID: ${e.threadId}\nMessage ID: ${e.id}\nFrom: ${e.from.name} <${e.from.email}>\nSubject: ${e.subject}\nSnippet: ${e.snippet}`,
    )
    .join('\n\n---\n\n')

  const result = await agent.invoke(
    { messages: [new HumanMessage(`Process these ${input.emails.length} emails:\n\n${emailsText}`)] },
    threadId,
    { userId, accessToken },
  )

  return extractLastAIContent(result.messages)
}
