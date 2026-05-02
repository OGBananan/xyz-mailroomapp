import { Router } from 'express'
import { invokeAgent } from '../services/agent-runtime.js'

export const agentRoutes = Router()

agentRoutes.post('/triage', async (req, res, next) => {
  try {
    const result = await invokeAgent({
      action: 'triage',
      input: req.body,
      sessionId: req.header('x-session-id'),
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
})

agentRoutes.post('/draft', async (req, res, next) => {
  try {
    const result = await invokeAgent({
      action: 'draft',
      input: req.body,
      sessionId: req.header('x-session-id'),
    })
    res.json(result)
  } catch (err) {
    next(err)
  }
})
