import express from 'express'
import { routes } from './routes/index.js'
import { errorHandler } from './middleware/error.js'

export const app = express()

app.use(express.json({ limit: '1mb' }))
app.use('/api', routes)
app.use(errorHandler)
