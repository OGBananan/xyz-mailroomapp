export interface EmailAddress {
  name: string
  email: string
}

export interface Email {
  id: string
  threadId: string
  subject: string
  from: EmailAddress
  to: EmailAddress[]
  snippet: string
  body: string
  receivedAt: string
  labelIds: string[]
}
