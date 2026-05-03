import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'

interface AuthenticatedRequest extends Request {
  userId:    string
  userEmail: string
  userName:  string
}

export const UserId    = createParamDecorator((_: unknown, ctx: ExecutionContext) =>
  (ctx.switchToHttp().getRequest<AuthenticatedRequest>()).userId)

export const UserEmail = createParamDecorator((_: unknown, ctx: ExecutionContext) =>
  (ctx.switchToHttp().getRequest<AuthenticatedRequest>()).userEmail)

export const UserName  = createParamDecorator((_: unknown, ctx: ExecutionContext) =>
  (ctx.switchToHttp().getRequest<AuthenticatedRequest>()).userName)
