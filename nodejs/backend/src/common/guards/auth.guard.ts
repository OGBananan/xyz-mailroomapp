import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'
import { GoogleOAuthService } from '../../auth/google-oauth.service.js'
// TODO: restore when DynamoDB is configured
// import { SessionsRepo } from '../../dynamo/repos/sessions.repo.js'
// import { UsersRepo }    from '../../dynamo/repos/users.repo.js'

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name)

  constructor(
    private readonly oauth: GoogleOAuthService,
    // TODO: restore when DynamoDB is configured
    // private readonly sessions: SessionsRepo,
    // private readonly users:    UsersRepo,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request & { userId: string; userEmail: string; userName: string }>()
    const sid = req.cookies?.['sid'] as string | undefined

    if (!sid) {
      this.logger.debug('auth failed: no session cookie')
      throw new UnauthorizedException('No session cookie')
    }

    // TODO: restore when DynamoDB is configured
    // const session = await this.sessions.get({ sid })
    // if (!session || session.expiresAt < Math.floor(Date.now() / 1000)) {
    //   this.logger.debug(`auth failed: session expired or not found sid=${sid.slice(0, 8)}`)
    //   throw new UnauthorizedException('Session expired')
    // }
    // const user = await this.users.get({ userId: session.userId })
    // if (!user) {
    //   this.logger.debug(`auth failed: user not found userId=${session.userId}`)
    //   throw new UnauthorizedException('User not found')
    // }
    // req.userId    = user.userId
    // req.userEmail = user.email
    // req.userName  = user.name

    const dev = this.oauth.getDevToken(sid)
    if (!dev) {
      this.logger.debug(`auth failed: no dev token for sid=${sid.slice(0, 8)}`)
      throw new UnauthorizedException('Session not found')
    }
    req.userId    = sid
    req.userEmail = dev.email
    req.userName  = dev.name
    return true
  }
}
