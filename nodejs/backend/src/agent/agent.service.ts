import { Injectable, Logger } from '@nestjs/common'
import { BedrockAgentCoreClient, InvokeAgentRuntimeCommand } from '@aws-sdk/client-bedrock-agentcore'
import { env } from '../config/env.js'

export type AgentAction = 'triage' | 'draft'

export interface InvokeParams {
  action:      AgentAction
  input:       unknown
  sessionId:   string
  userId:      string
  accessToken: string
}


@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name)
  private readonly client = new BedrockAgentCoreClient({ region: env.AWS_REGION })

  private runtimeArn(action: AgentAction): string {
    return action === 'triage' ? env.EVALUATOR_RUNTIME_ARN : env.DRAFT_RUNTIME_ARN
  }

  private payload(params: InvokeParams): Buffer {
    return Buffer.from(JSON.stringify({
      action:      params.action,
      input:       params.input,
      userId:      params.userId,
      accessToken: params.accessToken,
    }))
  }

  private makeCommand(params: InvokeParams, accept: string): InvokeAgentRuntimeCommand {
    return new InvokeAgentRuntimeCommand({
      agentRuntimeArn:  this.runtimeArn(params.action),
      ...(env.AGENTCORE_QUALIFIER ? { qualifier: env.AGENTCORE_QUALIFIER } : {}),
      runtimeSessionId: params.sessionId,
      contentType:      'application/json',
      accept,
      payload:          this.payload(params),
    })
  }

  // ─── Unary (evaluator / triage) ───────────────────────────────────────────

  async invoke(params: InvokeParams): Promise<unknown> {
    if (env.AGENT_CLIENT === 'stub') return this.stub(params)

    this.logger.debug(`invoke action=${params.action} session=${params.sessionId}`)

    const ac    = new AbortController()
    const timer = setTimeout(() => ac.abort(), env.AGENT_TIMEOUT_MS)

    try {
      const response = await this.client.send(this.makeCommand(params, 'application/json'), { abortSignal: ac.signal })
      if (!response.response) throw new Error('AgentCore: no response body')
      const text = await response.response.transformToString('utf-8')
      try { return JSON.parse(text) } catch { throw new Error(`Agent non-JSON: ${text.slice(0, 200)}`) }
    } finally {
      clearTimeout(timer)
    }
  }

  // ─── Stub ─────────────────────────────────────────────────────────────────

  private stub(params: InvokeParams): unknown {
    this.logger.debug(`stub action=${params.action}`)
    return { ok: true, summary: `[stub] ${params.action} completed` }
  }
}
