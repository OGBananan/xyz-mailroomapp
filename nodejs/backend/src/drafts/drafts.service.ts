import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import type { gmail_v1 } from 'googleapis'
import { GmailService } from '../gmail/gmail.service.js'
import { AgentService } from '../agent/agent.service.js'
import { EventsService } from '../events/events.service.js'
import { AgentRunsRepo } from '../dynamo/repos/agent-runs.repo.js'
function parseFrom(raw: string): { name: string; email: string } {
  const match = raw.match(/^(.*?)\s*<(.+?)>$/)
  return match ? { name: match[1]?.trim() ?? '', email: match[2] ?? '' } : { name: '', email: raw }
}

@Injectable()
export class DraftsService {
  private readonly logger = new Logger(DraftsService.name)

  constructor(
    private readonly gmail: GmailService,
    private readonly agent: AgentService,
    private readonly events: EventsService,
    private readonly agentRuns: AgentRunsRepo,
  ) {}

  async requestDraft(userId: string, accessToken: string, threadId: string, feedback?: string): Promise<void> {
    const thread = await this.gmail.getThread(accessToken, threadId)
    if (!thread) throw new NotFoundException('Thread not found')

    const msgs = (thread as gmail_v1.Schema$Thread).messages ?? []
    if (!msgs.length) throw new NotFoundException('Thread has no messages')

    const latest = msgs[msgs.length - 1]!
    const headers = latest.payload?.headers ?? []
    const get = (n: string) => headers.find((h) => h.name === n)?.value ?? ''

    const input = {
      email: {
        threadId,
        messageId: latest.id ?? '',
        subject: get('Subject'),
        from: parseFrom(get('From')),
        snippet: latest.snippet ?? '',
      },
      ...(feedback ? { userContext: feedback } : {}),
    }

    const runId = randomUUID()
    const ttl = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
    await this.agentRuns.put({ userId, runId, action: 'draft', inputDigest: threadId.slice(0, 16), status: 'running', ttl })

    try {
      // Agent autonomously fetches full thread, writes the draft, and saves it to Gmail.
      await this.agent.invoke({ action: 'draft', input, userId, accessToken, sessionId: userId })
      await this.agentRuns.update({ userId, runId }, { status: 'completed', completedAt: Date.now() })
      this.events.publish(userId, 'draft.ready', { threadId })
    } catch (err) {
      await this.agentRuns.update({
        userId,
        runId,
      }, { status: 'failed', error: err instanceof Error ? err.message : String(err), completedAt: Date.now() })
      this.events.publish(userId, 'error', { message: `Draft failed for ${threadId}` })
      throw err
    }
  }

  async saveUserDraft(accessToken: string, threadId: string, body: string): Promise<void> {
    const thread = await this.gmail.getThread(accessToken, threadId)
    if (!thread) throw new NotFoundException('Thread not found')
    const msgs = (thread as gmail_v1.Schema$Thread).messages ?? []
    const latest = msgs[msgs.length - 1]
    if (!latest) throw new NotFoundException('Thread has no messages')
    const messageId = latest.id ?? ''
    const existing = await this.gmail.getDraftForThread(accessToken, threadId)
    if (existing) {
      await this.gmail.updateDraft(accessToken, existing.draftId, threadId, messageId, body)
    } else {
      await this.gmail.createDraft(accessToken, threadId, messageId, body)
    }
  }

  async sendDraft(userId: string, accessToken: string, threadId: string): Promise<void> {
    const draft = await this.gmail.getDraftForThread(accessToken, threadId)
    if (!draft) throw new NotFoundException('No draft found for thread')
    await this.gmail.sendDraft(accessToken, draft.draftId)
    await this.gmail.moveThread(accessToken, userId, threadId, 'review', 'ready')
    this.events.publish(userId, 'card.updated', { threadId, column: 'ready' })
  }
}
