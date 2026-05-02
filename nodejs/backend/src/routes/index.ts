import { Router } from 'express'
import { agentRoutes } from './agent.js'
import { threadRoutes } from './threads.js'

export const routes = Router()

routes.use('/agent', agentRoutes)
routes.use('/threads', threadRoutes)
