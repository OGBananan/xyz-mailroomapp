import { Controller, Post, Put, Param, Body, UseGuards, Logger } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { AuthGuard }          from '../common/guards/auth.guard.js'
import { UserId }             from '../common/decorators/user.decorator.js'
import { GoogleOAuthService } from '../auth/google-oauth.service.js'
import { DraftsService }      from './drafts.service.js'
import { RefineDraftDto }     from './dto/refine-draft.dto.js'
import { SaveDraftDto }       from './dto/save-draft.dto.js'

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
    @Body() dto: RefineDraftDto,
  ) {
    const jobId = randomUUID()
    const token = await this.oauth.getValidAccessToken(userId)
    this.drafts.requestDraft(userId, token, threadId, dto.feedback).catch(err =>
      this.logger.error(err, `draft refine failed ${threadId}`),
    )
    return { jobId }
  }

  @Put('draft')
  async saveDraft(
    @UserId() userId: string,
    @Param('threadId') threadId: string,
    @Body() dto: SaveDraftDto,
  ) {
    const token = await this.oauth.getValidAccessToken(userId)
    await this.drafts.saveUserDraft(token, threadId, dto.body)
    return { ok: true }
  }

  @Post('send')
  async send(@UserId() userId: string, @Param('threadId') threadId: string) {
    const token = await this.oauth.getValidAccessToken(userId)
    await this.drafts.sendDraft(userId, token, threadId)
    return { ok: true }
  }
}
