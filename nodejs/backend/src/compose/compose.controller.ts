import { Controller, Post, Body, UseGuards } from '@nestjs/common'
import { AuthGuard }       from '../common/guards/auth.guard.js'
import { UserId }          from '../common/decorators/user.decorator.js'
import { ComposeService }  from './compose.service.js'
import { ComposeEmailDto } from './dto/compose-email.dto.js'

@Controller('compose')
@UseGuards(AuthGuard)
export class ComposeController {
  constructor(private readonly compose: ComposeService) {}

  @Post()
  async send(@UserId() userId: string, @Body() dto: ComposeEmailDto) {
    await this.compose.send(userId, dto)
    return { ok: true }
  }
}
