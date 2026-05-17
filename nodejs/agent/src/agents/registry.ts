import { AgentRegistry, McpToolSet } from '@ogbananan/agentcore'
import { MemorySaver } from '@langchain/langgraph'
import { BoardActionSet } from '../tools/BoardActionSet.js'
import { MeetingsActionSet } from '../tools/MeetingsActionSet.js'
import { MoneyActionSet } from '../tools/MoneyActionSet.js'
import { PackagesActionSet } from '../tools/PackagesActionSet.js'

// Shared checkpointer — persists thread state across invocations within the same session
export const checkpointer = new MemorySaver()

// Shared ActionSet instances — tools read userId/accessToken from RunnableConfig at call time
const board = new BoardActionSet()
const meetings = new MeetingsActionSet()
const money = new MoneyActionSet()
const packages = new PackagesActionSet()

/**
 * Builds a fresh AgentRegistry per invocation, connecting a new McpToolSet
 * with the caller's OAuth access token so Gmail MCP calls are user-scoped.
 *
 * ActionSets are shared across invocations; only the McpToolSet is per-call.
 */
export async function buildRegistry(accessToken: string): Promise<AgentRegistry> {
  const gmailMcp = await McpToolSet.connect({
    gmail: {
      url: process.env['GMAIL_MCP_URL'] ?? 'http://localhost:3100',
      transport: 'http',
      headers: { Authorization: `Bearer ${accessToken}` },
      reconnect: { enabled: true, maxAttempts: 3, delayMs: 1000 },
    },
  })

  const registry = new AgentRegistry()
  registry.registerToolSet(board)
  registry.registerToolSet(meetings)
  registry.registerToolSet(money)
  registry.registerToolSet(packages)
  registry.registerToolSet(gmailMcp)

  return registry
}
