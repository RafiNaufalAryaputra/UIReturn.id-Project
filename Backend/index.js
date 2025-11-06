import express from 'express'
import cors from 'cors'
import itemsRouter from './routes/items.js'
import { join, dirname } from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

const app = express()
app.use(cors())
app.use(express.json())

// Determine directory of this file (robust even if process.cwd differs)
const __dirname = dirname(fileURLToPath(import.meta.url))
// base directory for backend files (the folder where this index.js lives)
const backendDir = __dirname
const dbPath = join(backendDir, 'db.json')

// ensure db file exists in the same folder as this file
await fs.mkdir(backendDir, { recursive: true })
try { await fs.access(dbPath) } catch { await fs.writeFile(dbPath, JSON.stringify({ items: [] }, null, 2)) }

app.use('/api/items', itemsRouter)

app.get('/', (req, res) => res.json({ ok: true, message: 'UIReturn backend' }))

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`))
