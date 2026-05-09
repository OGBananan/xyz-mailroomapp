import { Controller, Get, Patch, Delete, Param, Body, UseGuards, NotFoundException, Logger } from '@nestjs/common'
import { AuthGuard }          from '../common/guards/auth.guard.js'
import { UserId }             from '../common/decorators/user.decorator.js'
import { GoogleOAuthService } from '../auth/google-oauth.service.js'
import { EventsService }      from '../events/events.service.js'
import { CardsService }       from './cards.service.js'
import { DraftsService }      from '../drafts/drafts.service.js'
import { MoveCardDto }        from './dto/move-card.dto.js'

@Controller('cards')
@UseGuards(AuthGuard)
export class CardsController {
  private readonly logger = new Logger(CardsController.name)

  constructor(
    private readonly cards:  CardsService,
    private readonly drafts: DraftsService,
    private readonly oauth:  GoogleOAuthService,
    private readonly events: EventsService,
  ) {}

  @Get()
  async getBoard(@UserId() userId: string) {
    const token = await this.oauth.getValidAccessToken(userId)
    return this.cards.getBoard(userId, token)
  }

  @Get(':threadId')
  async getCard(@UserId() userId: string, @Param('threadId') threadId: string) {
    const token = await this.oauth.getValidAccessToken(userId)
    const card  = await this.cards.getCardDetail(userId, token, threadId)
    if (!card) throw new NotFoundException('Thread not found')
    return card
  }

  @Patch(':threadId')
  async moveCard(
    @UserId() userId: string,
    @Param('threadId') threadId: string,
    @Body() dto: MoveCardDto,
  ) {
    const token = await this.oauth.getValidAccessToken(userId)
    const card  = await this.cards.getCardDetail(userId, token, threadId)
    if (!card) throw new NotFoundException('Thread not found')

    await this.cards.moveCard(userId, token, threadId, card.column, dto.column)
    this.events.publish(userId, 'card.updated', { threadId, column: dto.column })

    if (dto.column === 'review') {
      this.drafts.requestDraft(userId, token, threadId).catch(err =>
        this.logger.error(err, `auto-draft failed on move ${threadId}`),
      )
    }

    return { ok: true, threadId, column: dto.column }
  }

  @Delete(':threadId')
  async hideCard(@UserId() userId: string, @Param('threadId') threadId: string) {
    const token = await this.oauth.getValidAccessToken(userId)
    const card  = await this.cards.getCardDetail(userId, token, threadId)
    if (!card) throw new NotFoundException('Thread not found')
    await this.cards.moveCard(userId, token, threadId, card.column, 'hidden')
    this.events.publish(userId, 'card.updated', { threadId, column: 'hidden' })
    return { ok: true }
  }
}
