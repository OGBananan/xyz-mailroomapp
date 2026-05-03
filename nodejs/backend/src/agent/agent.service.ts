import { Injectable, Logger } from '@nestjs/common'
import { BedrockAgentCoreClient, InvokeAgentRuntimeCommand } from '@aws-sdk/client-bedrock-agentcore'
import { env } from '../config/env.js'

export type AgentAction = 'triage' | 'draft' | 'refine'

export interface InvokeParams {
  action:     AgentAction
  input:      unknown
  sessionId?: string
}

export interface StreamChunk { token: string }

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name)
  private readonly client = new BedrockAgentCoreClient({ region: env.AWS_REGION })

  private payload(params: InvokeParams): Buffer {
    return Buffer.from(JSON.stringify({ action: params.action, input: params.input }))
  }

  // ─── Unary (used for triage) ──────────────────────────────────────────────

  async invoke(params: InvokeParams): Promise<unknown> {
    if (env.AGENT_CLIENT === 'stub') return this.stub(params)

    this.logger.debug(`invokeAgent action=${params.action} session=${params.sessionId}`)

    const command = new InvokeAgentRuntimeCommand({
      agentRuntimeArn: env.AGENTCORE_RUNTIME_ARN,
      ...(env.AGENTCORE_QUALIFIER ? { qualifier: env.AGENTCORE_QUALIFIER } : {}),
      runtimeSessionId: params.sessionId ?? 'default',
      contentType: 'application/json',
      accept:      'application/json',
      payload:     this.payload(params),
    })

    const response = await this.client.send(command)
    if (!response.response) throw new Error('AgentCore: no response body')

    const text = await response.response.transformToString('utf-8')
    try { return JSON.parse(text) } catch { throw new Error(`Agent non-JSON: ${text.slice(0, 200)}`) }
  }

  // ─── Streaming (used for draft/refine) ───────────────────────────────────

  async *stream(params: InvokeParams): AsyncGenerator<StreamChunk> {
    if (env.AGENT_CLIENT === 'stub') { yield* this.stubStream(params); return }

    this.logger.debug(`invokeAgentStream action=${params.action} session=${params.sessionId}`)

    const command = new InvokeAgentRuntimeCommand({
      agentRuntimeArn: env.AGENTCORE_RUNTIME_ARN,
      ...(env.AGENTCORE_QUALIFIER ? { qualifier: env.AGENTCORE_QUALIFIER } : {}),
      runtimeSessionId: params.sessionId ?? 'default',
      contentType: 'application/json',
      accept:      'text/event-stream',
      payload:     this.payload(params),
    })

    const response = await this.client.send(command)
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
        } catch { if (data) yield { token: data } }
      }
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
