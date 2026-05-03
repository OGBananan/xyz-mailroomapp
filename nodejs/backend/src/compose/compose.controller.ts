import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common'
import { z } from 'zod'
import { AuthGuard }          from '../common/guards/auth.guard.js'
import { UserId }             from '../common/decorators/user.decorator.js'
import { GoogleOAuthService } from '../auth/google-oauth.service.js'
import { GmailService }       from '../gmail/gmail.service.js'

const ComposeSchema = z.object({
  to:      z.string().min(1),
  cc:      z.string().default(''),
  bcc:     z.string().default(''),
  subject: z.string().min(1),
  body:    z.string().min(1),
})

@Controller('compose')
@UseGuards(AuthGuard)
export class ComposeController {
  constructor(
    private readonly oauth: GoogleOAuthService,
    private readonly gmail: GmailService,
  ) {}

  @Post()
  async send(@UserId() userId: string, @Body() body: unknown) {
    const parsed = ComposeSchema.safeParse(body)
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten())
    const token = await this.oauth.getValidAccessToken(userId)
    const { to, cc, bcc, subject, body: text } = parsed.data
    await this.gmail.sendEmail(token, to, cc, bcc, subject, text)
    return { ok: true }
  }
}
