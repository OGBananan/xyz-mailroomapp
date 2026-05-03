import { Injectable, UnauthorizedException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { SessionsRepo } from '../dynamo/repos/sessions.repo.js'
import { UsersRepo }    from '../dynamo/repos/users.repo.js'
import { env }          from '../config/env.js'

@Injectable()
export class AuthService {
  constructor(
    private readonly sessions: SessionsRepo,
    private readonly users:    UsersRepo,
  ) {}

  async createSession(userId: string): Promise<string> {
    const sid       = randomUUID()
    const expiresAt = Math.floor(Date.now() / 1000) + env.SESSION_TTL_SECONDS
    await this.sessions.put({ sid, userId, expiresAt })
    return sid
  }

  async destroySession(sid: string): Promise<void> {
    await this.sessions.delete({ sid })
  }

  async upsertUser(userId: string, email: string, name: string): Promise<void> {
    await this.users.put({ userId, email, name })
  }

  async validateSession(sid: string): Promise<{ userId: string }> {
    const session = await this.sessions.get({ sid })
    if (!session || session.expiresAt < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Session expired')
    }
    return { userId: session.userId }
  }
}
