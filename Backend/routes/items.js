import express from 'express'
import { nanoid } from 'nanoid'
import db from '../db.js'

const router = express.Router()

// GET /api/items?search=
router.get('/', async (req, res) => {
  await db.read()
  const q = (req.query.search || '').toLowerCase()
  let items = db.data.items || []
  if (q) {
    items = items.filter(it =>
      (it.title || '').toLowerCase().includes(q) ||
      (it.description || '').toLowerCase().includes(q) ||
      (it.location || '').toLowerCase().includes(q)
    )
  }
  res.json(items)
})

// GET /api/items/:id
router.get('/:id', async (req, res) => {
  await db.read()
  const it = (db.data.items || []).find(i => i.id === req.params.id)
  if (!it) return res.status(404).json({ error: 'Not found' })
  res.json(it)
})

// POST /api/items
router.post('/', async (req, res) => {
  const { title, description = '', location = '', contact = '', found = false, imageData = null } = req.body
  if (!title) return res.status(400).json({ error: 'title required' })
  const item = {
    id: nanoid(),
    title,
    description,
    location,
    contact,
    found: !!found,
    // optional base64 data URL of an uploaded image (string) - nullable
    imageData: imageData || null,
    createdAt: new Date().toISOString(),
    claimed: false,
    claimer: null
  }
  await db.read()
  db.data.items.unshift(item)
  await db.write()
  res.status(201).json(item)
})

// POST /api/items/:id/claim  { claimer }
router.post('/:id/claim', async (req, res) => {
  const { claimer } = req.body
  if (!claimer) return res.status(400).json({ error: 'claimer required' })
  await db.read()
  const idx = (db.data.items || []).findIndex(i => i.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  db.data.items[idx].claimed = true
  db.data.items[idx].claimer = claimer
  await db.write()
  res.json(db.data.items[idx])
})

// DELETE /api/items/:id
router.delete('/:id', async (req, res) => {
  await db.read()
  db.data.items = (db.data.items || []).filter(i => i.id !== req.params.id)
  await db.write()
  res.status(204).end()
})

export default router
