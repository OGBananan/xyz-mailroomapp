import { Module } from '@nestjs/common'
import { SyncController } from './sync.controller.js'
import { SyncService }    from './sync.service.js'
import { SyncScheduler }  from './sync.scheduler.js'
import { AuthModule }     from '../auth/auth.module.js'

@Module({
  imports:     [AuthModule],
  controllers: [SyncController],
  providers:   [SyncService, SyncScheduler],
  exports:     [SyncService],
})
export class SyncModule {}
