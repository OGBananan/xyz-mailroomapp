import { Module } from '@nestjs/common'
import { ComposeController } from './compose.controller.js'
import { AuthModule }        from '../auth/auth.module.js'

@Module({
  imports:     [AuthModule],
  controllers: [ComposeController],
})
export class ComposeModule {}
