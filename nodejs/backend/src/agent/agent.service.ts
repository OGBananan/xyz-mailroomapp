import { Injectable, Logger } from '@nestjs/common'
import { BedrockAgentCoreClient, InvokeAgentRuntimeCommand } from '@aws-sdk/client-bedrock-agentcore'
import { env } from '../config/env.js'

export type AgentAction = 'triage' | 'draft' | 'refine'

export interface InvokeParams {
  action:    AgentAction
  input:     unknown
  sessionId: string
}

export interface StreamChunk { token: string }

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name)
  private readonly client = new BedrockAgentCoreClient({ region: env.AWS_REGION })

  // 'triage' → evaluator agent; 'draft' | 'refine' → draft agent
  private runtimeArn(action: AgentAction): string {
    return action === 'triage' ? env.EVALUATOR_RUNTIME_ARN : env.DRAFT_RUNTIME_ARN
  }

  private payload(params: InvokeParams): Buffer {
    return Buffer.from(JSON.stringify({ action: params.action, input: params.input }))
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

  // ─── Streaming (draft agent) ──────────────────────────────────────────────

  async *stream(params: InvokeParams): AsyncGenerator<StreamChunk> {
    if (env.AGENT_CLIENT === 'stub') { yield* this.stubStream(params); return }

    this.logger.debug(`stream action=${params.action} session=${params.sessionId}`)

    const ac    = new AbortController()
    const timer = setTimeout(() => ac.abort(), env.AGENT_TIMEOUT_MS)

    try {
      const response = await this.client.send(this.makeCommand(params, 'text/event-stream'), { abortSignal: ac.signal })
      if (!response.response) throw new Error('AgentCore: no streaming body')

      let buffer = ''
      for await (const chunk of response.response as AsyncIterable<Uint8Array>) {
        buffer += Buffer.from(chunk).toString('utf-8')
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const data = trimmed.slice(5).trim()
          if (!data || data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data) as { token?: string; text?: string }
            const token = parsed.token ?? parsed.text
            if (token) yield { token }
          } catch (err) {
            this.logger.warn(err, `stream parse error, raw: ${data.slice(0, 100)}`)
            if (data) yield { token: data }
          }
        }
      }
    } finally {
      clearTimeout(timer)
    }
  }

  // ─── Stub ─────────────────────────────────────────────────────────────────

  private stub(params: InvokeParams): unknown {
    if (params.action === 'triage') {
      const emails = (params.input as { emails: { id: string }[] }).emails
      return emails.map(e => ({
        emailId: e.id, include: true,
        reason: 'personal-reply-expected', confidence: 'high',
      }))
    }
    return { draft: '[stub] Thanks for your email, I will follow up shortly.' }
  }

  private async *stubStream(params: InvokeParams): AsyncGenerator<StreamChunk> {
    const result = this.stub(params) as { draft: string }
    for (const word of result.draft.split(' ')) {
      yield { token: word + ' ' }
      await new Promise<void>(r => setTimeout(r, 20))
    }
  }
}
