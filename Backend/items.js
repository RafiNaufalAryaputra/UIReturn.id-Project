import express from 'express'
import { nanoid } from 'nanoid'
import mongo from './mongo.js'

// collection name
const COLL = 'items'

const router = express.Router()

// GET /api/items?search=
router.get('/', async (req, res) => {
  try {
    const q = (req.query.search || '').trim()
    let col
    try {
      col = await mongo.getCollection(COLL)
    } catch (e) {
      console.error('[items] mongo unavailable', e && e.message ? e.message : e)
      return res.status(503).json({ error: 'database unavailable' })
    }

    if (col) {
      const filter = q ? {
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { location: { $regex: q, $options: 'i' } }
        ]
      } : {}
      const items = await col.find(filter).sort({ createdAt: -1 }).toArray()
      return res.json(items)
    }
  } catch (err) {
    console.error('GET /api/items error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// GET /api/items/:id
router.get('/:id', async (req, res) => {
  try {
    let col
    try { col = await mongo.getCollection(COLL) } catch (e) { return res.status(503).json({ error: 'database unavailable' }) }
    const it = await col.findOne({ id: req.params.id })
    if (!it) return res.status(404).json({ error: 'Not found' })
    res.json(it)
  } catch (err) {
    console.error('GET /api/items/:id error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// POST /api/items
router.post('/', async (req, res) => {
  try {
    const { title, description = '', location = '', contact = '', found = false, imageData = null } = req.body
    if (!title) return res.status(400).json({ error: 'title required' })
    const item = {
      id: nanoid(),
      title,
      description,
      location,
      contact,
      found: !!found,
      imageData: imageData || null,
      createdAt: new Date().toISOString(),
      claimed: false,
      claimer: null
    }

    let col
    try { col = await mongo.getCollection(COLL) } catch (e) { return res.status(503).json({ error: 'database unavailable' }) }
    await col.insertOne(item)
    return res.status(201).json(item)
  } catch (err) {
    console.error('POST /api/items error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// POST /api/items/:id/claim  { claimer }
router.post('/:id/claim', async (req, res) => {
  try {
    const { claimer } = req.body
    if (!claimer) return res.status(400).json({ error: 'claimer required' })
    let col
    try { col = await mongo.getCollection(COLL) } catch (e) { return res.status(503).json({ error: 'database unavailable' }) }
    const r = await col.findOneAndUpdate(
      { id: req.params.id },
      { $set: { claimed: true, claimer } },
      { returnDocument: 'after' }
    )
    if (!r.value) return res.status(404).json({ error: 'Not found' })
    return res.json(r.value)
  } catch (err) {
    console.error('POST /api/items/:id/claim error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// DELETE /api/items/:id
router.delete('/:id', async (req, res) => {
  try {
    let col
    try { col = await mongo.getCollection(COLL) } catch (e) { return res.status(503).json({ error: 'database unavailable' }) }
    await col.deleteOne({ id: req.params.id })
    return res.status(204).end()
  } catch (err) {
    console.error('DELETE /api/items/:id error', err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
