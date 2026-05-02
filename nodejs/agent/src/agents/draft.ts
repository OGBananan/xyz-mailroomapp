import { ChatAnthropic } from '@langchain/anthropic'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import type { DraftAgentInput, DraftAgentOutput } from '../types/index.js'

const model = new ChatAnthropic({
  model: 'claude-sonnet-4-6',
  temperature: 0.4,
})

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You write reply drafts on behalf of the user. Your drafts should be:
- Concise and direct — no filler phrases
- Written in the user's voice: natural, warm but not effusive
- 2–5 sentences unless more is clearly needed
- Ready to send as-is, but easy to edit

Do not include a subject line. Output only the body of the reply.`,
  ],
  [
    'human',
    `Original email:
From: {fromName} <{fromEmail}>
Subject: {subject}
Body:
{body}

{userContext}

Write a reply draft.`,
  ],
])

const parser = new StringOutputParser()
const chain = prompt.pipe(model).pipe(parser)

export const draftAgent = {
  invoke: async (input: DraftAgentInput): Promise<DraftAgentOutput> => {
    const draft = await chain.invoke({
      fromName: input.card.email.from.name,
      fromEmail: input.card.email.from.email,
      subject: input.card.email.subject,
      body: input.card.email.body,
      userContext: input.userContext
        ? `Additional context from user: ${input.userContext}`
        : '',
    })

    return { draft }
  },
}
