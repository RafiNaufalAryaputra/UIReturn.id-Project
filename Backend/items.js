import express from 'express'
import { nanoid } from 'nanoid'
import mongo from './mongo.js'
import { authMiddleware, requireAdmin } from './auth.js'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET || 'please-change-me'

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
    // if reporting a lost item (found === false) require authentication
    let reportedBy = null
    let reporterName = null
    if (!found) {
      const header = req.headers.authorization
      const token = header && header.split(' ')[1]
      if (!token) return res.status(401).json({ error: 'authentication required for lost reports' })
      try {
        const payload = jwt.verify(token, JWT_SECRET)
        reportedBy = payload.id
        reporterName = payload.name || payload.email
      } catch (err) {
        return res.status(401).json({ error: 'invalid token' })
      }
    }

    const item = {
      id: nanoid(),
      title,
      description,
      location,
      contact,
      found: !!found,
      imageData: imageData || null,
      createdAt: new Date().toISOString(),
      // claim fields
      claimed: false,
      claimer: null,
      claimerId: null,
      claimerName: null,
      claimStatus: 'none', // 'none' | 'pending' | 'approved' | 'rejected'
      // reporter metadata (if authenticated)
      reportedBy,
      reporterName
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

// POST /api/items/:id/claim  -> creates pending claim (requires authentication)
router.post('/:id/claim', authMiddleware, async (req, res) => {
  try {
    // derive claimer from authenticated user
    const user = req.user
    if (!user) return res.status(401).json({ error: 'unauthorized' })

    let col
    try { col = await mongo.getCollection(COLL) } catch (e) { return res.status(503).json({ error: 'database unavailable' }) }

    const claimerName = user.name || user.email || user.id
    const claimerId = user.id
    const r = await col.findOneAndUpdate(
      { id: req.params.id },
      { $set: { claimStatus: 'pending', claimer: claimerName, claimerId, claimerName } },
      { returnDocument: 'after' }
    )
    if (!r.value) return res.status(404).json({ error: 'Not found' })
    return res.json(r.value)
  } catch (err) {
    console.error('POST /api/items/:id/claim error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// PATCH /api/items/:id/claim/resolve { action: 'approve'|'reject' }  (admin only)
router.patch('/:id/claim/resolve', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { action } = req.body
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'invalid action' })
    let col
    try { col = await mongo.getCollection(COLL) } catch (e) { return res.status(503).json({ error: 'database unavailable' }) }

    const update = action === 'approve'
      ? { $set: { claimStatus: 'approved', claimed: true } }
      : { $set: { claimStatus: 'rejected' } }

    const r = await col.findOneAndUpdate(
      { id: req.params.id },
      update,
      { returnDocument: 'after' }
    )
    if (!r.value) return res.status(404).json({ error: 'Not found' })
    return res.json(r.value)
  } catch (err) {
    console.error('PATCH /api/items/:id/claim/resolve error', err)
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
