import { Module } from '@nestjs/common'
import { DraftsController } from './drafts.controller.js'
import { DraftsService }    from './drafts.service.js'
import { AuthModule }       from '../auth/auth.module.js'
import { CardsModule }      from '../cards/cards.module.js'

@Module({
  imports:     [AuthModule, CardsModule],
  controllers: [DraftsController],
  providers:   [DraftsService],
})
export class DraftsModule {}
