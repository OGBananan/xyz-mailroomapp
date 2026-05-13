import { Controller, Post, UseGuards } from '@nestjs/common'
import { AuthGuard }   from '../common/guards/auth.guard.js'
import { UserId }      from '../common/decorators/user.decorator.js'
import { SyncService } from './sync.service.js'

@Controller('sync')
@UseGuards(AuthGuard)
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Post()
  kickoff(@UserId() userId: string) {
    this.sync.runForUser(userId).catch(() => void 0)
    return { ok: true }
  }
}
