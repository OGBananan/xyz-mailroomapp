import { Module } from '@nestjs/common'
import { ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'
import { env } from './config/env.js'
import { DynamoModule } from './dynamo/dynamo.module.js'
import { CryptoModule } from './crypto/crypto.module.js'
import { AuthModule } from './auth/auth.module.js'
import { GmailModule } from './gmail/gmail.module.js'
import { AgentModule } from './agent/agent.module.js'
import { EventsModule } from './events/events.module.js'
import { SyncModule } from './sync/sync.module.js'
import { CardsModule } from './cards/cards.module.js'
import { DraftsModule } from './drafts/drafts.module.js'
import { ComposeModule } from './compose/compose.module.js'
import { HealthModule }  from './health/health.module.js'

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: env.NODE_ENV === 'development'
        ? { level: 'debug', transport: { target: 'pino-pretty' } }
        : { level: 'info' },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    DynamoModule,
    CryptoModule,
    AuthModule,
    GmailModule,
    AgentModule,
    EventsModule,
    SyncModule,
    CardsModule,
    DraftsModule,
    ComposeModule,
    HealthModule,
  ],
})
export class AppModule {}
