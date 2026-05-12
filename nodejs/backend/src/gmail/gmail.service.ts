import { Injectable } from '@nestjs/common'
import { google } from 'googleapis'
import type { gmail_v1 } from 'googleapis'
import { TRIAGE_LABELS, type BoardColumn, type ThreadSummary, type NewThreadInfo, type DraftInfo } from './interfaces/gmail.interfaces.js'

export { TRIAGE_LABELS, type BoardColumn, type ThreadSummary, type NewThreadInfo, type DraftInfo }

@Injectable()
export class GmailService {
  // In-process label-id cache per userId
  private readonly labelCache = new Map<string, Map<string, string>>()

  private makeClient(accessToken: string): gmail_v1.Gmail {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    return google.gmail({ version: 'v1', auth })
  }

  // ─── Label management ────────────────────────────────────────────────────

  private async resolveLabel(gmail: gmail_v1.Gmail, userId: string, name: string): Promise<string> {
    let cache = this.labelCache.get(userId)
    if (cache?.has(name)) return cache.get(name)!

    const { data } = await gmail.users.labels.list({ userId: 'me' })
    const found = data.labels?.find(l => l.name === name)
    let id = found?.id

    if (!id) {
      const { data: created } = await gmail.users.labels.create({
        userId: 'me',
        requestBody: { name, labelListVisibility: 'labelHide' },
      })
      id = created.id!
    }

    if (!cache) { cache = new Map(); this.labelCache.set(userId, cache) }
    cache.set(name, id)
    return id
  }

  // ─── Thread reads ─────────────────────────────────────────────────────────

  async listThreadsByLabel(accessToken: string, labelName: string): Promise<string[]> {
    const gmail = this.makeClient(accessToken)
    const { data } = await gmail.users.threads.list({
      userId: 'me', q: `label:${labelName}`, maxResults: 100,
    })
    return (data.threads ?? []).map(t => t.id!).filter(Boolean)
  }

  async getThreadSummary(accessToken: string, threadId: string): Promise<ThreadSummary | null> {
    const gmail = this.makeClient(accessToken)
    const { data } = await gmail.users.threads.get({
      userId: 'me', id: threadId, format: 'METADATA',
      metadataHeaders: ['From', 'Subject', 'Date'],
    })
    const messages = data.messages ?? []
    if (!messages.length) return null
    const latest  = messages[messages.length - 1]!
    const headers = latest.payload?.headers ?? []
    const get = (n: string) => headers.find(h => h.name === n)?.value ?? ''
    return {
      threadId: data.id!,
      latestMessageId: latest.id!,
      from:       get('From'),
      subject:    get('Subject'),
      snippet:    data.snippet ?? '',
      receivedAt: new Date(Number(latest.internalDate ?? 0)).toISOString(),
      labelIds:   latest.labelIds ?? [],
    }
  }

  async getThread(accessToken: string, threadId: string): Promise<gmail_v1.Schema$Thread | null> {
    const gmail = this.makeClient(accessToken)
    const { data } = await gmail.users.threads.get({ userId: 'me', id: threadId, format: 'FULL' })
    return data
  }

  // ─── Incremental sync ─────────────────────────────────────────────────────

  async listUntriaged(accessToken: string, maxResults: number): Promise<NewThreadInfo[]> {
    const gmail = this.makeClient(accessToken)
    const q = 'is:unread -label:triage/needs-you -label:triage/drafted -label:triage/done -label:triage/hidden'
    const { data } = await gmail.users.messages.list({ userId: 'me', q, maxResults })
    return this.hydrateMessages(gmail, data.messages ?? [])
  }

  async listNewSinceHistory(accessToken: string, startHistoryId: string): Promise<NewThreadInfo[]> {
    const gmail = this.makeClient(accessToken)
    const { data } = await gmail.users.history.list({
      userId: 'me', startHistoryId, historyTypes: ['messageAdded'],
    })
    const all = (data.history ?? []).flatMap(h => (h.messagesAdded ?? []).map(ma => ma.message!))
    const TRIAGE_NAMES = Object.values(TRIAGE_LABELS)
    const untriaged = all.filter(m => !m.labelIds?.some(id => TRIAGE_NAMES.some(n => id.includes(n))))
    return this.hydrateMessages(gmail, untriaged)
  }

  private async hydrateMessages(
    gmail: gmail_v1.Gmail,
    messages: { id?: string | null }[],
  ): Promise<NewThreadInfo[]> {
    const infos = await Promise.all(messages.map(async m => {
      const { data: msg } = await gmail.users.messages.get({
        userId: 'me', id: m.id!, format: 'METADATA', metadataHeaders: ['From', 'Subject'],
      })
      const headers = msg.payload?.headers ?? []
      const get = (n: string) => headers.find(h => h.name === n)?.value ?? ''
      return {
        threadId: msg.threadId!, latestMessageId: msg.id!,
        from: get('From'), subject: get('Subject'),
        snippet: msg.snippet ?? '',
        receivedAt: new Date(Number(msg.internalDate ?? 0)).toISOString(),
      }
    }))
    const seen = new Set<string>()
    return infos.filter(i => { if (seen.has(i.threadId)) return false; seen.add(i.threadId); return true })
  }

  async getCurrentHistoryId(accessToken: string): Promise<string> {
    const gmail = this.makeClient(accessToken)
    const { data } = await gmail.users.getProfile({ userId: 'me' })
    return data.historyId!
  }

  // ─── Label mutations ──────────────────────────────────────────────────────

  async moveThread(
    accessToken: string, userId: string,
    threadId: string, fromColumn: BoardColumn | null, toColumn: BoardColumn,
  ): Promise<void> {
    const gmail = this.makeClient(accessToken)
    const addId = await this.resolveLabel(gmail, userId, TRIAGE_LABELS[toColumn])
    const removeIds: string[] = []

    if (fromColumn) {
      removeIds.push(await this.resolveLabel(gmail, userId, TRIAGE_LABELS[fromColumn]))
    } else {
      const all = await Promise.all(
        Object.values(TRIAGE_LABELS).map(n => this.resolveLabel(gmail, userId, n)),
      )
      removeIds.push(...all.filter(id => id !== addId))
    }

    await gmail.users.threads.modify({
      userId: 'me', id: threadId,
      requestBody: { addLabelIds: [addId], removeLabelIds: removeIds },
    })
  }

  // ─── Drafts ───────────────────────────────────────────────────────────────

  async createDraft(
    accessToken: string, threadId: string, latestMessageId: string, body: string,
  ): Promise<string> {
    const gmail = this.makeClient(accessToken)
    const { data: orig } = await gmail.users.messages.get({ userId: 'me', id: latestMessageId })
    const headers = orig.payload?.headers ?? []
    const get = (n: string) => headers.find(h => h.name === n)?.value ?? ''
    const raw = Buffer.from([
      `To: ${get('From')}`, `Subject: Re: ${get('Subject')}`,
      `In-Reply-To: ${get('Message-ID')}`, `References: ${get('Message-ID')}`,
      'Content-Type: text/plain; charset=utf-8', '', body,
    ].join('\r\n')).toString('base64url')

    const { data } = await gmail.users.drafts.create({
      userId: 'me', requestBody: { message: { raw, threadId } },
    })
    return data.id!
  }

  async getDraftForThread(accessToken: string, threadId: string): Promise<DraftInfo | null> {
    const gmail = this.makeClient(accessToken)
    const { data } = await gmail.users.drafts.list({ userId: 'me' })
    for (const d of data.drafts ?? []) {
      const { data: full } = await gmail.users.drafts.get({ userId: 'me', id: d.id! })
      if (full.message?.threadId === threadId) {
        return { draftId: full.id!, body: this.extractBody(full.message?.payload ?? null) }
      }
    }
    return null
  }

  async updateDraft(
    accessToken: string, draftId: string, threadId: string, latestMessageId: string, body: string,
  ): Promise<void> {
    const gmail = this.makeClient(accessToken)
    const { data: orig } = await gmail.users.messages.get({ userId: 'me', id: latestMessageId })
    const headers = orig.payload?.headers ?? []
    const get = (n: string) => headers.find(h => h.name === n)?.value ?? ''
    const raw = Buffer.from([
      `To: ${get('From')}`, `Subject: Re: ${get('Subject')}`,
      `In-Reply-To: ${get('Message-ID')}`, `References: ${get('Message-ID')}`,
      'Content-Type: text/plain; charset=utf-8', '', body,
    ].join('\r\n')).toString('base64url')
    await gmail.users.drafts.update({
      userId: 'me', id: draftId,
      requestBody: { message: { raw, threadId } },
    })
  }

  async sendDraft(accessToken: string, draftId: string): Promise<void> {
    const gmail = this.makeClient(accessToken)
    await gmail.users.drafts.send({ userId: 'me', requestBody: { id: draftId } })
  }

  async sendEmail(accessToken: string, to: string, cc: string, bcc: string, subject: string, body: string): Promise<void> {
    const gmail = this.makeClient(accessToken)
    const lines = [`To: ${to}`]
    if (cc) lines.push(`Cc: ${cc}`)
    if (bcc) lines.push(`Bcc: ${bcc}`)
    lines.push(`Subject: ${subject}`, 'Content-Type: text/plain; charset=utf-8', '', body)
    await gmail.users.messages.send({
      userId: 'me', requestBody: { raw: Buffer.from(lines.join('\r\n')).toString('base64url') },
    })
  }

  private extractBody(payload: gmail_v1.Schema$MessagePart | null): string {
    if (!payload) return ''
    if (payload.body?.data) return Buffer.from(payload.body.data, 'base64').toString('utf-8')
    for (const part of payload.parts ?? []) {
      const text = this.extractBody(part)
      if (text) return text
    }
    return ''
  }

  inferColumnFromLabels(labelIds: string[]): BoardColumn {
    if (labelIds.some(id => id.toLowerCase().includes('needs-you'))) return 'decide'
    if (labelIds.some(id => id.toLowerCase().includes('drafted')))   return 'review'
    if (labelIds.some(id => id.toLowerCase().includes('done')))      return 'ready'
    if (labelIds.some(id => id.toLowerCase().includes('hidden')))    return 'hidden'
    return 'decide'
  }
}
