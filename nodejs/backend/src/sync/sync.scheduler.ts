import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { SyncService } from './sync.service.js'
import { TokensRepo }  from '../dynamo/repos/tokens.repo.js'
import { env }         from '../config/env.js'

@Injectable()
export class SyncScheduler {
  private readonly logger = new Logger(SyncScheduler.name)

  constructor(
    private readonly sync:   SyncService,
    private readonly tokens: TokensRepo,
  ) {}

  @Cron(env.SYNC_CRON)
  async runAll() {
    this.logger.debug('cron: starting sync sweep')
    try {
      const userIds = await this.tokens.scanUserIds()
      await Promise.allSettled(userIds.map(id => this.sync.runForUser(id)))
    } catch (err) {
      this.logger.error(err, 'cron sweep failed')
    }
  }
}
