import { BedrockAgentCoreApp } from 'bedrock-agentcore/runtime'
import { runTriageAgent } from './agents/triage.js'
import { runDraftAgent } from './agents/draft.js'
import type { AgentPayload } from './types/index.js'

const app = new BedrockAgentCoreApp({
  invocationHandler: {
    process: async (payload, context) => {
      const { action, input, userId, accessToken } = payload as AgentPayload
      const threadId = context.sessionId

      console.log(`[${action}] session=${threadId} user=${userId}`)

      if (action === 'triage') {
        const summary = await runTriageAgent(input, threadId, userId, accessToken)
        return { ok: true, summary }
      }

      if (action === 'draft') {
        const summary = await runDraftAgent(input, threadId, userId, accessToken)
        return { ok: true, summary }
      }

      throw new Error(`Unknown action: ${String(action)}`)
    },
  },
})

app.run()
