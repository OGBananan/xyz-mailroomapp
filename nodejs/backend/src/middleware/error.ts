import type { ErrorRequestHandler } from 'express'
import { logger } from '../lib/logger.js'

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error(err)
  res.status(500).json({ error: err instanceof Error ? err.message : 'unknown error' })
}
