import { Router } from 'express'

export const threadRoutes = Router()

threadRoutes.get('/', (_req, res) => {
  res.json({ threads: [] })
})
