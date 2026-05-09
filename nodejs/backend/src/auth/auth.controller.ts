import { Controller, Get, Post, Query, Req, Res, UseGuards, BadRequestException } from '@nestjs/common'
import type { Request, Response } from 'express'
import { AuthGuard }         from '../common/guards/auth.guard.js'
import { UserId, UserEmail, UserName } from '../common/decorators/user.decorator.js'
import { GoogleOAuthService } from './google-oauth.service.js'
import { AuthService }        from './auth.service.js'
import { env }                from '../config/env.js'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly oauth: GoogleOAuthService,
    private readonly auth:  AuthService,
  ) {}

  @Get('google')
  redirectToGoogle(@Res() res: Response) {
    res.redirect(this.oauth.buildAuthUrl())
  }

  @Get('google/callback')
  async handleCallback(@Query('code') code: string, @Res() res: Response) {
    if (!code) throw new BadRequestException('Missing code')

    const { tokens, profile } = await this.oauth.exchangeCode(code)

    // TODO: restore when DynamoDB is configured
    // await this.auth.upsertUser(profile.userId, profile.email, profile.name)
    // await this.oauth.persistTokens(profile.userId, tokens)
    // const sid = await this.auth.createSession(profile.userId)
    this.oauth.storeDevToken(profile.userId, tokens.accessToken, profile.email, profile.name)
    const sid = profile.userId

    res.cookie('sid', sid, {
      httpOnly: true,
      secure:   env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   env.SESSION_TTL_SECONDS * 1000,
    })
    res.redirect(env.FRONTEND_ORIGIN)
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    const sid = req.cookies?.['sid'] as string | undefined
    // TODO: restore when DynamoDB is configured
    // if (sid) await this.auth.destroySession(sid)
    if (sid) this.oauth.clearDevToken(sid)
    res.clearCookie('sid')
    res.json({ ok: true })
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(
    @UserId()    userId: string,
    @UserEmail() email:  string,
    @UserName()  name:   string,
  ) {
    return { id: userId, email, name }
  }
}
