import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import type { gmail_v1 } from 'googleapis'
import { GmailService }       from '../gmail/gmail.service.js'
import { AgentService }       from '../agent/agent.service.js'
import { EventsService }      from '../events/events.service.js'
import { AgentRunsRepo }      from '../dynamo/repos/agent-runs.repo.js'
import { CardsService }       from '../cards/cards.service.js'

interface DraftContext {
  threadId:        string
  latestMessageId: string
  subject:         string
  from:            string
  snippet:         string
}

@Injectable()
export class DraftsService {
  private readonly logger = new Logger(DraftsService.name)

  constructor(
    private readonly gmail:     GmailService,
    private readonly agent:     AgentService,
    private readonly events:    EventsService,
    private readonly agentRuns: AgentRunsRepo,
    private readonly cards:     CardsService,
  ) {}

  async buildContext(accessToken: string, threadId: string): Promise<DraftContext | null> {
    const thread = await this.gmail.getThread(accessToken, threadId)
    if (!thread) return null
    const msgs = (thread as gmail_v1.Schema$Thread).messages ?? []
    if (!msgs.length) return null
    const latest  = msgs[msgs.length - 1]!
    const headers = latest.payload?.headers ?? []
    const get = (n: string) => headers.find(h => h.name === n)?.value ?? ''
    return {
      threadId,
      latestMessageId: latest.id ?? '',
      subject:         get('Subject'),
      from:            get('From'),
      snippet:         latest.snippet ?? '',
    }
  }

  async requestDraft(userId: string, accessToken: string, threadId: string, feedback?: string): Promise<void> {
    const ctx = await this.buildContext(accessToken, threadId)
    if (!ctx) throw new NotFoundException('Thread not found')

    const action = feedback ? ('refine' as const) : ('draft' as const)
    const card   = {
      id: ctx.threadId,
      email: { id: ctx.latestMessageId, threadId: ctx.threadId, subject: ctx.subject, from: ctx.from, snippet: ctx.snippet },
      ...(feedback ? { userContext: feedback } : {}),
    }

    const runId = randomUUID()
    const ttl   = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
    await this.agentRuns.put({ userId, runId, action, inputDigest: threadId.slice(0, 16), status: 'running', ttl })

    let full = ''
    try {
      for await (const chunk of this.agent.stream({ action, input: { card }, sessionId: userId })) {
        full += chunk.token
        this.events.publish(userId, 'draft.chunk', { threadId, token: chunk.token })
      }
      this.events.publish(userId, 'draft.done', { threadId })

      const existing = await this.gmail.getDraftForThread(accessToken, threadId)
      if (existing) {
        await this.gmail.updateDraft(accessToken, existing.draftId, threadId, ctx.latestMessageId, full.trim())
      } else {
        await this.gmail.createDraft(accessToken, threadId, ctx.latestMessageId, full.trim())
      }

      await this.agentRuns.update({ userId, runId }, { status: 'completed', output: { draft: full }, completedAt: Date.now() })
      this.events.publish(userId, 'draft.ready', { threadId })
    } catch (err) {
      await this.agentRuns.update({ userId, runId }, { status: 'failed', error: err instanceof Error ? err.message : String(err), completedAt: Date.now() })
      this.events.publish(userId, 'error', { message: `Draft failed for ${threadId}` })
      throw err
    }
  }

  async saveUserDraft(accessToken: string, threadId: string, body: string): Promise<void> {
    const ctx = await this.buildContext(accessToken, threadId)
    if (!ctx) throw new NotFoundException('Thread not found')
    const existing = await this.gmail.getDraftForThread(accessToken, threadId)
    if (existing) {
      await this.gmail.updateDraft(accessToken, existing.draftId, threadId, ctx.latestMessageId, body)
    } else {
      await this.gmail.createDraft(accessToken, threadId, ctx.latestMessageId, body)
    }
  }

  async sendDraft(userId: string, accessToken: string, threadId: string): Promise<void> {
    const draft = await this.gmail.getDraftForThread(accessToken, threadId)
    if (!draft) throw new NotFoundException('No draft found for thread')
    await this.gmail.sendDraft(accessToken, draft.draftId)
    await this.gmail.moveThread(accessToken, userId, threadId, 'review', 'ready')
    this.cards.invalidateCache(userId)
    this.events.publish(userId, 'card.updated', { threadId, column: 'ready' })
  }
}
