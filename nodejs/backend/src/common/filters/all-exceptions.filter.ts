import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx    = host.switchToHttp()
    const res    = ctx.getResponse<Response>()
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    if (status >= 500) this.logger.error(exception)

    // NestJS HttpExceptions carry a response object with { message, error, statusCode }.
    // Flatten it so the frontend always gets { error: string | string[] }.
    if (exception instanceof HttpException) {
      const body = exception.getResponse()
      if (typeof body === 'object' && body !== null) {
        res.status(status).json(body)
      } else {
        res.status(status).json({ error: body })
      }
      return
    }

    const message = exception instanceof Error ? exception.message : 'Internal server error'
    res.status(status).json({ error: message })
  }
}
