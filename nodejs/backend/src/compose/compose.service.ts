import { Injectable } from '@nestjs/common'
import { GoogleOAuthService } from '../auth/google-oauth.service.js'
import { GmailService }       from '../gmail/gmail.service.js'
import { ComposeEmailDto }    from './dto/compose-email.dto.js'

@Injectable()
export class ComposeService {
  constructor(
    private readonly oauth: GoogleOAuthService,
    private readonly gmail: GmailService,
  ) {}

  async send(userId: string, dto: ComposeEmailDto): Promise<void> {
    const token = await this.oauth.getValidAccessToken(userId)
    await this.gmail.sendEmail(token, dto.to, dto.cc ?? '', dto.bcc ?? '', dto.subject, dto.body)
  }
}
