import { Module } from '@nestjs/common'
import { DraftsController } from './drafts.controller.js'
import { DraftsService }    from './drafts.service.js'
import { AuthModule }       from '../auth/auth.module.js'

@Module({
  imports:     [AuthModule],
  controllers: [DraftsController],
  providers:   [DraftsService],
  exports:     [DraftsService],
})
export class DraftsModule {}
