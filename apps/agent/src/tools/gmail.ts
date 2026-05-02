import { google } from 'googleapis'
import type { Email } from '@inbox-triage/types'

const TRIAGE_LABELS = {
  NEEDS_YOU: 'triage/needs-you',
  DRAFTED: 'triage/drafted',
  DONE: 'triage/done',
  HIDDEN: 'triage/hidden',
} as const

export function createGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: accessToken })
  return google.gmail({ version: 'v1', auth })
}

export async function fetchUnreadEmails(accessToken: string, maxResults = 50): Promise<Email[]> {
  const gmail = createGmailClient(accessToken)

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread -label:triage',
    maxResults,
  })

  const messages = listRes.data.messages ?? []

  const emails = await Promise.all(
    messages.map(async (msg) => {
      const full = await gmail.users.messages.get({ userId: 'me', id: msg.id! })
      return parseMessage(full.data)
    })
  )

  return emails.filter((e): e is Email => e !== null)
}

export async function applyLabel(
  accessToken: string,
  messageId: string,
  label: keyof typeof TRIAGE_LABELS
): Promise<void> {
  const gmail = createGmailClient(accessToken)
  const labelName = TRIAGE_LABELS[label]

  const labelsRes = await gmail.users.labels.list({ userId: 'me' })
  let labelId = labelsRes.data.labels?.find((l) => l.name === labelName)?.id

  if (!labelId) {
    const created = await gmail.users.labels.create({
      userId: 'me',
      requestBody: { name: labelName, labelListVisibility: 'labelHide' },
    })
    labelId = created.data.id!
  }

  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    requestBody: { addLabelIds: [labelId] },
  })
}

export async function saveDraft(
  accessToken: string,
  originalMessageId: string,
  replyBody: string
): Promise<string> {
  const gmail = createGmailClient(accessToken)

  const original = await gmail.users.messages.get({ userId: 'me', id: originalMessageId })
  const headers = original.data.payload?.headers ?? []
  const subject = headers.find((h) => h.name === 'Subject')?.value ?? ''
  const from = headers.find((h) => h.name === 'From')?.value ?? ''
  const messageId = headers.find((h) => h.name === 'Message-ID')?.value ?? ''

  const rawMessage = [
    `To: ${from}`,
    `Subject: Re: ${subject}`,
    `In-Reply-To: ${messageId}`,
    `References: ${messageId}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    replyBody,
  ].join('\r\n')

  const encoded = Buffer.from(rawMessage).toString('base64url')

  const draft = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: {
        raw: encoded,
        threadId: original.data.threadId ?? undefined,
      },
    },
  })

  return draft.data.id!
}

function parseMessage(msg: Parameters<typeof parseMessage>[0]): Email | null {
  if (!msg.id || !msg.threadId) return null

  const headers = msg.payload?.headers ?? []
  const get = (name: string) => headers.find((h) => h.name === name)?.value ?? ''

  const fromRaw = get('From')
  const fromMatch = fromRaw.match(/^(.*?)\s*<(.+?)>$/)
  const from = fromMatch
    ? { name: fromMatch[1]?.trim() ?? '', email: fromMatch[2] ?? '' }
    : { name: '', email: fromRaw }

  const body = extractBody(msg.payload)

  return {
    id: msg.id,
    threadId: msg.threadId,
    subject: get('Subject'),
    from,
    to: [],
    snippet: msg.snippet ?? '',
    body,
    receivedAt: new Date(Number(msg.internalDate)).toISOString(),
    labelIds: msg.labelIds ?? [],
  }
}

function extractBody(payload: Parameters<typeof extractBody>[0]): string {
  if (!payload) return ''
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8')
  }
  for (const part of payload.parts ?? []) {
    const text = extractBody(part)
    if (text) return text
  }
  return ''
}
