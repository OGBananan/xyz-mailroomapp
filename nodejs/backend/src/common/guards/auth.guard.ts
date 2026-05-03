import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'
import { SessionsRepo } from '../../dynamo/repos/sessions.repo.js'
import { UsersRepo }    from '../../dynamo/repos/users.repo.js'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly sessions: SessionsRepo,
    private readonly users:    UsersRepo,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { userId: string; userEmail: string; userName: string }>()
    const sid = req.cookies?.['sid'] as string | undefined

    if (!sid) throw new UnauthorizedException('No session cookie')

    const session = await this.sessions.get({ sid })
    if (!session || session.expiresAt < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Session expired')
    }

    const user = await this.users.get({ userId: session.userId })
    if (!user) throw new UnauthorizedException('User not found')

    req.userId    = user.userId
    req.userEmail = user.email
    req.userName  = user.name
    return true
  }
}
