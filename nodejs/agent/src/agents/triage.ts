import { ChatAnthropic } from '@langchain/anthropic'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { JsonOutputParser } from '@langchain/core/output_parsers'
import type { TriageAgentInput, TriageAgentOutput } from '../types/index.js'

const model = new ChatAnthropic({
  model: 'claude-sonnet-4-6',
  temperature: 0,
})

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an inbox triage assistant. Your job is to decide which emails genuinely need the user's attention.

Include an email ONLY if it matches one of these reasons:
- "personal-reply-expected": a real person sent this and expects a reply
- "decision-needed": the user must make a decision
- "question-for-you": a direct question addressed to the user

Everything else (newsletters, notifications, receipts, FYIs, automated emails) should be excluded.

Respond with a JSON object matching this schema:
{{
  "results": [
    {{
      "emailId": string,
      "include": boolean,
      "reason": "personal-reply-expected" | "decision-needed" | "question-for-you" | null,
      "confidence": "high" | "medium" | "low"
    }}
  ]
}}`,
  ],
  [
    'human',
    `Triage these emails:

{emails}`,
  ],
])

const parser = new JsonOutputParser<TriageAgentOutput>()

const chain = prompt.pipe(model).pipe(parser)

export const triageAgent = {
  invoke: async (input: TriageAgentInput): Promise<TriageAgentOutput> => {
    const emailsSummary = input.emails
      .map(
        (e) =>
          `ID: ${e.id}\nFrom: ${e.from.name} <${e.from.email}>\nSubject: ${e.subject}\nSnippet: ${e.snippet}`
      )
      .join('\n\n---\n\n')

    return chain.invoke({ emails: emailsSummary })
  },
}
