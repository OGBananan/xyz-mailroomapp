import 'dotenv/config'
import 'reflect-metadata'
import cookieParser from 'cookie-parser'
import { NestFactory } from '@nestjs/core'
import { Logger } from 'nestjs-pino'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module.js'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js'
import { env } from './config/env.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })

  app.useLogger(app.get(Logger))
  app.enableCors({ origin: env.FRONTEND_ORIGIN, credentials: true })
  app.use(cookieParser())
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.setGlobalPrefix('api', { exclude: ['/auth/(.*)', '/health'] })

  await app.listen(env.PORT)
}

bootstrap()
