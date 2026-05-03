import { Controller, Get, Patch, Delete, Param, Body, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common'
import { z } from 'zod'
import { AuthGuard }          from '../common/guards/auth.guard.js'
import { UserId }             from '../common/decorators/user.decorator.js'
import { GoogleOAuthService } from '../auth/google-oauth.service.js'
import { EventsService }      from '../events/events.service.js'
import { CardsService }       from './cards.service.js'
import type { BoardColumn }   from '../gmail/gmail.service.js'

const MoveSchema = z.object({ column: z.enum(['decide', 'review', 'ready', 'hidden']) })

@Controller('cards')
@UseGuards(AuthGuard)
export class CardsController {
  constructor(
    private readonly cards:  CardsService,
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
    @Body() body: unknown,
  ) {
    const parsed = MoveSchema.safeParse(body)
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten())

    const token = await this.oauth.getValidAccessToken(userId)
    const card  = await this.cards.getCardDetail(userId, token, threadId)
    if (!card) throw new NotFoundException('Thread not found')

    await this.cards.moveCard(userId, token, threadId, card.column as BoardColumn, parsed.data.column)
    this.events.publish(userId, 'card.updated', { threadId, column: parsed.data.column })
    return { ok: true, threadId, column: parsed.data.column }
  }

  @Delete(':threadId')
  async hideCard(@UserId() userId: string, @Param('threadId') threadId: string) {
    const token = await this.oauth.getValidAccessToken(userId)
    const card  = await this.cards.getCardDetail(userId, token, threadId)
    if (!card) throw new NotFoundException('Thread not found')

    await this.cards.moveCard(userId, token, threadId, card.column as BoardColumn, 'hidden')
    this.events.publish(userId, 'card.updated', { threadId, column: 'hidden' })
    return { ok: true }
  }
}
