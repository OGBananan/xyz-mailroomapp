import { Global, Module } from '@nestjs/common'
import { GmailService } from './gmail.service.js'

@Global()
@Module({ providers: [GmailService], exports: [GmailService] })
export class GmailModule {}
