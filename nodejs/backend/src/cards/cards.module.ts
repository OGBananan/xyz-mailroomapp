import { Module } from '@nestjs/common'
import { CardsController } from './cards.controller.js'
import { CardsService }    from './cards.service.js'
import { AuthModule }      from '../auth/auth.module.js'

@Module({
  imports:     [AuthModule],
  controllers: [CardsController],
  providers:   [CardsService],
  exports:     [CardsService],
})
export class CardsModule {}
