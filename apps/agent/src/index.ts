import { BedrockAgentCoreApp } from 'bedrock-agentcore/runtime'
import { triageAgent } from './agents/triage.js'
import { draftAgent } from './agents/draft.js'
import type { TriageAgentInput, DraftAgentInput } from '@inbox-triage/types'

type AgentPayload =
  | { action: 'triage'; input: TriageAgentInput }
  | { action: 'draft'; input: DraftAgentInput }

const app = new BedrockAgentCoreApp({
  invocationHandler: {
    process: async (payload, context) => {
      const { action, input } = payload as AgentPayload
      console.log(`Session ${context.sessionId} - action: ${action}`)

      if (action === 'triage') {
        return triageAgent.invoke(input as TriageAgentInput)
      }

      if (action === 'draft') {
        return draftAgent.invoke(input as DraftAgentInput)
      }

      throw new Error(`Unknown action: ${String(action)}`)
    },
  },
})

app.run()
