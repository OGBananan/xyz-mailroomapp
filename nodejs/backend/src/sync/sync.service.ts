import { Injectable, Logger } from '@nestjs/common'
import { createHash, randomUUID } from 'crypto'
import { GoogleOAuthService } from '../auth/google-oauth.service.js'
import { GmailService, type NewThreadInfo } from '../gmail/gmail.service.js'
import { AgentService } from '../agent/agent.service.js'
import { EventsService } from '../events/events.service.js'
import { AgentRunsRepo } from '../dynamo/repos/agent-runs.repo.js'
import { env } from '../config/env.js'

const BATCH = 10

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name)
  private readonly syncing = new Set<string>()

  constructor(
    private readonly oauth: GoogleOAuthService,
    private readonly gmail: GmailService,
    private readonly agent: AgentService,
    private readonly events: EventsService,
    private readonly agentRuns: AgentRunsRepo,
  ) {}

  async runForUser(userId: string): Promise<void> {
    if (this.syncing.has(userId)) {
      this.logger.debug(`sync already running for ${userId}`)
      return
    }
    this.syncing.add(userId)
    this.events.publish(userId, 'sync.started', { userId })

    try {
      const accessToken = await this.oauth.getValidAccessToken(userId)
      const threads = await this.gmail.listUntriaged(accessToken, env.SYNC_BACKFILL_MAX)

      this.logger.log(`sync ${userId}: ${threads.length} threads to triage`)

      for (let i = 0; i < threads.length; i += BATCH) {
        await this.triageBatch(userId, accessToken, threads.slice(i, i + BATCH))
      }

      this.events.publish(userId, 'sync.completed', { userId, count: threads.length })
    } catch (err) {
      this.logger.error(err, `sync failed for ${userId}`)
      this.events.publish(userId, 'error', { message: err instanceof Error ? err.message : 'sync failed' })
    } finally {
      this.syncing.delete(userId)
    }
  }

  private async triageBatch(userId: string, accessToken: string, batch: NewThreadInfo[]): Promise<void> {
    const emails = batch.map((t) => ({
      id: t.latestMessageId,
      threadId: t.threadId,
      from: t.from,
      subject: t.subject,
      snippet: t.snippet,
      to: [],
      body: '',
      receivedAt: new Date().toISOString(),
      labelIds: [],
    }))

    const inputDigest = createHash('sha256').update(JSON.stringify(emails)).digest('hex').slice(0, 16)
    const runId = randomUUID()
    const ttl = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60

    await this.agentRuns.put({ userId, runId, action: 'triage', inputDigest, status: 'running', ttl })

    try {
      // Agent is fully autonomous: it applies Gmail labels, writes DynamoDB records, and
      // emits card.created events itself via its tools. We just fire and track the run.
      await this.agent.invoke({
        action: 'triage',
        input: { emails },
        userId,
        accessToken,
        sessionId: userId,
      })

      await this.agentRuns.update({ userId, runId }, { status: 'completed', completedAt: Date.now() })
    } catch (err) {
      await this.agentRuns.update({
        userId,
        runId,
      }, { status: 'failed', error: err instanceof Error ? err.message : String(err), completedAt: Date.now() })
      throw err
    }
  }
}
