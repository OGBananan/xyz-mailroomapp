import { Module } from '@nestjs/common'
import { SyncService } from './sync.service.js'
import { AuthModule }  from '../auth/auth.module.js'

@Module({
  imports:   [AuthModule],
  providers: [SyncService],
  exports:   [SyncService],
})
export class SyncModule {}
