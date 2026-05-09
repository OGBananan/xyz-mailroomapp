import { Injectable, Logger } from '@nestjs/common'
import { createHash, randomUUID } from 'crypto'
import { GoogleOAuthService }  from '../auth/google-oauth.service.js'
import { GmailService, type NewThreadInfo } from '../gmail/gmail.service.js'
import { AgentService }        from '../agent/agent.service.js'
import { EventsService }       from '../events/events.service.js'
import { ThreadMetaRepo }      from '../dynamo/repos/thread-meta.repo.js'
import { SyncStateRepo }       from '../dynamo/repos/sync-state.repo.js'
import { AgentRunsRepo }       from '../dynamo/repos/agent-runs.repo.js'
import { mapVerdictToColumn, type TriageVerdict } from './column-mapping.js'
import { env } from '../config/env.js'

const BATCH = 10

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name)

  constructor(
    private readonly oauth:      GoogleOAuthService,
    private readonly gmail:      GmailService,
    private readonly agent:      AgentService,
    private readonly events:     EventsService,
    private readonly threadMeta: ThreadMetaRepo,
    private readonly syncState:  SyncStateRepo,
    private readonly agentRuns:  AgentRunsRepo,
  ) {}

  async runForUser(userId: string): Promise<void> {
    const locked = await this.syncState.acquireLock(userId)
    if (!locked) { this.logger.debug(`sync already running for ${userId}`); return }

    this.events.publish(userId, 'sync.started', { userId })

    try {
      const accessToken  = await this.oauth.getValidAccessToken(userId)
      const state        = await this.syncState.get({ userId })
      const newHistoryId = await this.gmail.getCurrentHistoryId(accessToken)

      const threads = state?.lastHistoryId
        ? await this.gmail.listNewSinceHistory(accessToken, String(state.lastHistoryId))
        : await this.gmail.listUntriaged(accessToken, env.SYNC_BACKFILL_MAX)

      this.logger.log(`sync ${userId}: ${threads.length} threads to triage`)

      for (let i = 0; i < threads.length; i += BATCH) {
        await this.triageBatch(userId, accessToken, threads.slice(i, i + BATCH), newHistoryId)
      }

      // Write final state — full put, no partial update needed
      await this.syncState.put({ userId, lastHistoryId: newHistoryId, lastSyncedAt: Date.now(), status: 'idle' })
      this.events.publish(userId, 'sync.completed', { userId, count: threads.length })
    } catch (err) {
      this.logger.error(err, `sync failed for ${userId}`)
      // Release lock on failure
      await this.syncState.update({ userId }, { status: 'idle' })
      this.events.publish(userId, 'error', { message: err instanceof Error ? err.message : 'sync failed' })
    }
  }

  private async triageBatch(
    userId: string, accessToken: string,
    batch: NewThreadInfo[], historyId: string,
  ): Promise<void> {
    const emailsInput = batch.map(t => ({
      id: t.latestMessageId, from: t.from, subject: t.subject, snippet: t.snippet,
    }))

    const inputDigest = createHash('sha256').update(JSON.stringify(emailsInput)).digest('hex').slice(0, 16)
    const runId = randomUUID()
    const ttl   = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60

    // Record the agent run
    await this.agentRuns.put({ userId, runId, action: 'triage', inputDigest, status: 'running', ttl })

    let verdicts: { emailId: string; include: boolean; reason: string | null; confidence: string }[]

    try {
      const result = await this.agent.invoke({ action: 'triage', input: { emails: emailsInput }, sessionId: userId })
      verdicts = result as typeof verdicts
      await this.agentRuns.update({ userId, runId }, { status: 'completed', output: result, completedAt: Date.now() })
    } catch (err) {
      await this.agentRuns.update({ userId, runId }, { status: 'failed', error: err instanceof Error ? err.message : String(err), completedAt: Date.now() })
      throw err
    }

    await Promise.all(batch.map(async thread => {
      const verdict = verdicts.find(v => v.emailId === thread.latestMessageId)
      if (!verdict) return

      const tv: TriageVerdict = {
        include:    verdict.include,
        reason:     verdict.reason,
        confidence: (verdict.confidence as TriageVerdict['confidence']) ?? 'low',
      }
      const { column, autoDraft } = mapVerdictToColumn(tv)

      await this.gmail.moveThread(accessToken, userId, thread.threadId, null, column)
      await this.threadMeta.put({
        userId, threadId: thread.threadId,
        triageReason: verdict.reason ?? '', confidence: tv.confidence,
        agentRunId: runId, lastTriagedHistoryId: historyId,
      })

      this.events.publish(userId, 'card.created', {
        threadId: thread.threadId, column, triageReason: verdict.reason, confidence: tv.confidence,
      })

      if (autoDraft) {
        this.generateDraft(userId, accessToken, thread).catch(err =>
          this.logger.error(err, `auto-draft failed for ${thread.threadId}`),
        )
      }
    }))
  }

  async generateDraft(userId: string, accessToken: string, thread: NewThreadInfo): Promise<void> {
    const card  = { id: thread.threadId, email: { id: thread.latestMessageId, threadId: thread.threadId, subject: thread.subject, from: thread.from, snippet: thread.snippet } }
    const runId = randomUUID()
    const ttl   = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60

    await this.agentRuns.put({ userId, runId, action: 'draft', inputDigest: thread.threadId.slice(0, 16), status: 'running', ttl })
    let full = ''

    try {
      for await (const chunk of this.agent.stream({ action: 'draft', input: { card }, sessionId: userId })) {
        full += chunk.token
        this.events.publish(userId, 'draft.chunk', { threadId: thread.threadId, token: chunk.token })
      }
      this.events.publish(userId, 'draft.done', { threadId: thread.threadId })
      await this.gmail.createDraft(accessToken, thread.threadId, thread.latestMessageId, full.trim())
      await this.agentRuns.update({ userId, runId }, { status: 'completed', output: { draft: full }, completedAt: Date.now() })
      this.events.publish(userId, 'draft.ready', { threadId: thread.threadId })
    } catch (err) {
      await this.agentRuns.update({ userId, runId }, { status: 'failed', error: err instanceof Error ? err.message : String(err), completedAt: Date.now() })
      this.events.publish(userId, 'error', { message: `Draft failed for ${thread.threadId}` })
    }
  }
}
