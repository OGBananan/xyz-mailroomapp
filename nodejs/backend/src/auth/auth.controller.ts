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

  /** Dev-only: create an in-memory session without going through Google OAuth.
   *  GET /auth/dev-login?userId=test&email=test@local&name=Test */
  @Get('dev-login')
  devLogin(
    @Query('userId') userId: string = 'dev-user',
    @Query('email')  email:  string = 'dev@local',
    @Query('name')   name:   string = 'Dev User',
    @Res() res: Response,
  ) {
    if (env.NODE_ENV === 'production') {
      res.status(404).json({ error: 'Not found' })
      return
    }
    this.oauth.storeDevToken(userId, 'dev-access-token', email, name)
    res.cookie('sid', userId, { httpOnly: true, sameSite: 'lax', maxAge: 86_400_000 })
    res.json({ ok: true, userId, email, name })
  }

  @Get('google')
  redirectToGoogle(@Res() res: Response) {
    res.redirect(this.oauth.buildAuthUrl())
  }

  @Get('google/callback')
  async handleCallback(@Query('code') code: string, @Res() res: Response) {
    if (!code) throw new BadRequestException('Missing code')

    const { tokens, profile } = await this.oauth.exchangeCode(code)

    await this.auth.upsertUser(profile.userId, profile.email, profile.name)
    await this.oauth.persistTokens(profile.userId, tokens)
    const sid = await this.auth.createSession(profile.userId)

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
    if (sid) await this.auth.destroySession(sid)
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
