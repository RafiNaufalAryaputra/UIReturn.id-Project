import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongo from './mongo.js'
import itemsRouter from './items.js'
import usersRouter from './users.js'
import messagesRouter from './messages.js'
import dmRouter from './dm.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

// serve uploads (attachments)
app.use('/uploads', express.static('uploads'))

app.use('/api/items', itemsRouter)
app.use('/api/users', usersRouter)
app.use('/api', messagesRouter)
app.use('/api/dm', dmRouter)

const PORT = process.env.PORT || 3000

async function start() {
	try {
		await mongo.connect()
		app.listen(PORT, () => console.log(`[backend] listening on http://localhost:${PORT}`))
	} catch (err) {
		console.error('Failed to start server', err)
		process.exit(1)
	}
}

start()
