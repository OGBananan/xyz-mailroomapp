import { Injectable } from '@nestjs/common'
import { google } from 'googleapis'
import { CryptoService } from '../crypto/crypto.service.js'
import { TokensRepo }    from '../dynamo/repos/tokens.repo.js'
import { env }           from '../config/env.js'

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
]

export interface GoogleProfile {
  userId: string
  email:  string
  name:   string
}

export interface RawTokens {
  accessToken:  string
  refreshToken: string
  expiresAt:    number
  scope:        string
}

interface DevTokenEntry { accessToken: string; email: string; name: string }

@Injectable()
export class GoogleOAuthService {
  // TODO: remove when DynamoDB is configured
  private readonly devTokens = new Map<string, DevTokenEntry>()

  storeDevToken(userId: string, accessToken: string, email: string, name: string): void {
    this.devTokens.set(userId, { accessToken, email, name })
  }

  clearDevToken(userId: string): void {
    this.devTokens.delete(userId)
  }

  getDevToken(userId: string): DevTokenEntry | undefined {
    return this.devTokens.get(userId)
  }

  constructor(
    private readonly crypto: CryptoService,
    private readonly tokens: TokensRepo,
  ) {}

  private makeClient() {
    return new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI,
    )
  }

  buildAuthUrl(): string {
    return this.makeClient().generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    })
  }

  async exchangeCode(code: string): Promise<{ tokens: RawTokens; profile: GoogleProfile }> {
    const client = this.makeClient()
    const { tokens } = await client.getToken(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Google token exchange: missing access or refresh token')
    }

    client.setCredentials(tokens)
    const { data } = await google.oauth2({ version: 'v2', auth: client }).userinfo.get()
    if (!data.id || !data.email) throw new Error('Google profile: missing id or email')

    return {
      tokens: {
        accessToken:  tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt:    tokens.expiry_date ?? Date.now() + 3_600_000,
        scope:        tokens.scope ?? SCOPES.join(' '),
      },
      profile: { userId: data.id, email: data.email, name: data.name ?? data.email },
    }
  }

  async persistTokens(userId: string, raw: RawTokens): Promise<void> {
    const [encAT, encRT] = await Promise.all([
      this.crypto.encrypt(raw.accessToken),
      this.crypto.encrypt(raw.refreshToken),
    ])
    await this.tokens.put({
      userId,
      encryptedAccessToken:  encAT,
      encryptedRefreshToken: encRT,
      expiresAt:             raw.expiresAt,
      scope:                 raw.scope,
    })
  }

  /** Returns a valid access token, refreshing automatically if needed. */
  async getValidAccessToken(userId: string): Promise<string> {
    // TODO: remove when DynamoDB is configured
    const dev = this.devTokens.get(userId)
    if (dev) return dev.accessToken

    const record = await this.tokens.get({ userId })
    if (!record) throw new Error(`No OAuth tokens for user ${userId}`)

    const [accessToken, refreshToken] = await Promise.all([
      this.crypto.decrypt(record.encryptedAccessToken),
      this.crypto.decrypt(record.encryptedRefreshToken),
    ])

    if (record.expiresAt > Date.now() + 60_000) return accessToken

    const client = this.makeClient()
    client.setCredentials({ refresh_token: refreshToken })
    const { credentials } = await client.refreshAccessToken()
    if (!credentials.access_token) throw new Error('Token refresh: no access_token returned')

    await this.persistTokens(userId, {
      accessToken:  credentials.access_token,
      refreshToken: credentials.refresh_token ?? refreshToken,
      expiresAt:    credentials.expiry_date ?? Date.now() + 3_600_000,
      scope:        credentials.scope ?? record.scope ?? '',
    })

    return credentials.access_token
  }
}
