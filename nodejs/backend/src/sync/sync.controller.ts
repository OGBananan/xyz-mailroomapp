import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { AuthGuard }    from '../common/guards/auth.guard.js'
import { UserId }       from '../common/decorators/user.decorator.js'
import { SyncService }  from './sync.service.js'
import { SyncStateRepo } from '../dynamo/repos/sync-state.repo.js'

@Controller('sync')
@UseGuards(AuthGuard)
export class SyncController {
  constructor(
    private readonly sync:  SyncService,
    private readonly state: SyncStateRepo,
  ) {}

  @Post()
  async kickoff(@UserId() userId: string) {
    const jobId = randomUUID()
    this.sync.runForUser(userId).catch(() => void 0)
    return { jobId }
  }

  @Get('status')
  async status(@UserId() userId: string) {
    const s = await this.state.get({ userId })
    return {
      lastSyncedAt:  s?.lastSyncedAt  ?? null,
      status:        s?.status        ?? 'idle',
      lastHistoryId: s?.lastHistoryId ?? null,
    }
  }
}
