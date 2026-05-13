import { Global, Module } from '@nestjs/common'
import { UsersRepo }      from './repos/users.repo.js'
import { TokensRepo }     from './repos/tokens.repo.js'
import { SessionsRepo }   from './repos/sessions.repo.js'
import { ThreadMetaRepo } from './repos/thread-meta.repo.js'

import { AgentRunsRepo }  from './repos/agent-runs.repo.js'

const REPOS = [UsersRepo, TokensRepo, SessionsRepo, ThreadMetaRepo, AgentRunsRepo]

@Global()
@Module({ providers: REPOS, exports: REPOS })
export class DynamoModule {}
