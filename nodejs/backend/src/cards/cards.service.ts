import { Injectable } from '@nestjs/common'
import { GmailService, TRIAGE_LABELS, type BoardColumn, type ThreadSummary } from '../gmail/gmail.service.js'
import { ThreadMetaRepo } from '../dynamo/repos/thread-meta.repo.js'

export interface CardSummary extends ThreadSummary {
  column:       BoardColumn
  triageReason: string | null
  confidence:   string | null
  hasDraft:     boolean
}

export interface Board {
  decide: CardSummary[]
  review: CardSummary[]
  ready:  CardSummary[]
  hidden: CardSummary[]
}

export interface CardDetail {
  threadId:     string
  column:       BoardColumn
  triageReason: string | null
  confidence:   string | null
  thread:       unknown
  draft:        { draftId: string; body: string } | null
}

@Injectable()
export class CardsService {
  constructor(
    private readonly gmail:      GmailService,
    private readonly threadMeta: ThreadMetaRepo,
  ) {}

  async getBoard(userId: string, accessToken: string): Promise<Board> {
    const columns: BoardColumn[] = ['decide', 'review', 'ready', 'hidden']

    const threadIdsByCol = await Promise.all(
      columns.map(col => this.gmail.listThreadsByLabel(accessToken, TRIAGE_LABELS[col])),
    )
    const allIds = threadIdsByCol.flat()

    const summaries = await this.batchSummaries(accessToken, allIds)
    const metaMap   = await this.threadMeta.batchGet(userId, allIds)

    const board: Board = { decide: [], review: [], ready: [], hidden: [] }
    columns.forEach((col, i) => {
      for (const threadId of threadIdsByCol[i] ?? []) {
        const s = summaries.get(threadId)
        if (!s) continue
        const m = metaMap.get(threadId)
        board[col].push({
          ...s, column: col,
          triageReason: m?.triageReason ?? null,
          confidence:   m?.confidence ?? null,
          hasDraft:     col === 'review',
        })
      }
    })

    return board
  }

  private async batchSummaries(accessToken: string, ids: string[]): Promise<Map<string, ThreadSummary>> {
    const CONCURRENCY = 10
    const result = new Map<string, ThreadSummary>()
    for (let i = 0; i < ids.length; i += CONCURRENCY) {
      const batch    = ids.slice(i, i + CONCURRENCY)
      const summaries = await Promise.all(batch.map(id => this.gmail.getThreadSummary(accessToken, id)))
      summaries.forEach((s, j) => { if (s) result.set(batch[j]!, s) })
    }
    return result
  }

  async getCardDetail(userId: string, accessToken: string, threadId: string): Promise<CardDetail | null> {
    const [thread, meta, draft] = await Promise.all([
      this.gmail.getThread(accessToken, threadId),
      this.threadMeta.get({ userId, threadId }),
      this.gmail.getDraftForThread(accessToken, threadId),
    ])
    if (!thread) return null

    const msgs    = (thread as { messages?: { labelIds?: string[] }[] }).messages ?? []
    const labelIds = msgs[msgs.length - 1]?.labelIds ?? []
    return {
      threadId, column: this.gmail.inferColumnFromLabels(labelIds),
      triageReason: meta?.triageReason ?? null,
      confidence:   meta?.confidence ?? null,
      thread, draft,
    }
  }

  async moveCard(userId: string, accessToken: string, threadId: string, from: BoardColumn, to: BoardColumn): Promise<void> {
    await this.gmail.moveThread(accessToken, userId, threadId, from, to)
  }
}
