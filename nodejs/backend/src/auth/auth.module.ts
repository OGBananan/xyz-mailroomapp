import { Module } from '@nestjs/common'
import { AuthController }    from './auth.controller.js'
import { AuthService }       from './auth.service.js'
import { GoogleOAuthService } from './google-oauth.service.js'
import { AuthGuard }         from '../common/guards/auth.guard.js'

@Module({
  controllers: [AuthController],
  providers:   [AuthService, GoogleOAuthService, AuthGuard],
  exports:     [GoogleOAuthService, AuthGuard],
})
export class AuthModule {}
