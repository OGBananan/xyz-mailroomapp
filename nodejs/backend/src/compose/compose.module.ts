import { Module } from '@nestjs/common'
import { ComposeController } from './compose.controller.js'
import { ComposeService }    from './compose.service.js'
import { AuthModule }        from '../auth/auth.module.js'

@Module({
  imports:     [AuthModule],
  controllers: [ComposeController],
  providers:   [ComposeService],
})
export class ComposeModule {}
