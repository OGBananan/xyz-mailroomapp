import { Controller, Post, Put, Param, Body, UseGuards, BadRequestException, Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { AuthGuard }          from '../common/guards/auth.guard.js'
import { UserId }             from '../common/decorators/user.decorator.js'
import { GoogleOAuthService } from '../auth/google-oauth.service.js'
import { DraftsService }      from './drafts.service.js'

const RefineSchema    = z.object({ feedback: z.string().min(1) })
const SaveDraftSchema = z.object({ body:     z.string().min(1) })

@Controller('cards/:threadId')
@UseGuards(AuthGuard)
export class DraftsController {
  private readonly logger = new Logger(DraftsController.name)

  constructor(
    private readonly drafts: DraftsService,
    private readonly oauth:  GoogleOAuthService,
  ) {}

  @Post('draft')
  async requestDraft(@UserId() userId: string, @Param('threadId') threadId: string) {
    const jobId = randomUUID()
    const token = await this.oauth.getValidAccessToken(userId)
    this.drafts.requestDraft(userId, token, threadId).catch(err =>
      this.logger.error(err, `draft failed ${threadId}`),
    )
    return { jobId }
  }

  @Post('draft/refine')
  async refineDraft(
    @UserId() userId: string,
    @Param('threadId') threadId: string,
    @Body() body: unknown,
  ) {
    const parsed = RefineSchema.safeParse(body)
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten())
    const jobId = randomUUID()
    const token = await this.oauth.getValidAccessToken(userId)
    this.drafts.requestDraft(userId, token, threadId, parsed.data.feedback).catch(err =>
      this.logger.error(err, `draft refine failed ${threadId}`),
    )
    return { jobId }
  }

  @Put('draft')
  async saveDraft(
    @UserId() userId: string,
    @Param('threadId') threadId: string,
    @Body() body: unknown,
  ) {
    const parsed = SaveDraftSchema.safeParse(body)
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten())
    const token = await this.oauth.getValidAccessToken(userId)
    await this.drafts.saveUserDraft(token, threadId, parsed.data.body)
    return { ok: true }
  }

  @Post('send')
  async send(@UserId() userId: string, @Param('threadId') threadId: string) {
    const token = await this.oauth.getValidAccessToken(userId)
    await this.drafts.sendDraft(userId, token, threadId)
    return { ok: true }
  }
}
