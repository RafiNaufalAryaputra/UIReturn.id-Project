import express from 'express'
import { nanoid } from 'nanoid'
import mongo from './mongo.js'
import { authMiddleware } from './auth.js'

const router = express.Router()
const COLL = 'messages'
const ITEMS = 'items'

// GET /api/items/:id/messages
router.get('/items/:id/messages', authMiddleware, async (req, res) => {
  try {
    const itemId = req.params.id
    let col
    try { col = await mongo.getCollection(COLL) } catch (e) { return res.status(503).json({ error: 'database unavailable' }) }
    // verify item and permission: only reporter, claimer or admin can read
    let itemsCol
    try { itemsCol = await mongo.getCollection(ITEMS) } catch (e) { return res.status(503).json({ error: 'database unavailable' }) }
    const item = await itemsCol.findOne({ id: itemId })
    if (!item) return res.status(404).json({ error: 'item not found' })
    const uid = req.user && req.user.id
    const isAdmin = req.user && req.user.isAdmin
    const isReporter = uid && item.reportedBy && uid === item.reportedBy
    // support legacy items where claimer was stored as a string (claimer) and new items with claimerId
    const hasClaimer = !!(item.claimerId || item.claimer)
    const isClaimer = uid && (
      (item.claimerId && uid === item.claimerId) ||
      (item.claimer && (item.claimer === req.user.name || item.claimer === req.user.email || item.claimer === uid))
    )
    // If there's no claimer yet, allow any authenticated user to read the thread (so they can ask the reporter questions).
    if (!hasClaimer) {
      if (!uid && !isAdmin) return res.status(401).json({ error: 'authentication required' })
    } else {
      if (!isAdmin && !isReporter && !isClaimer) return res.status(403).json({ error: 'forbidden' })
    }

    const messages = await col.find({ itemId }).sort({ createdAt: 1 }).toArray()
    return res.json(messages)
  } catch (err) {
    console.error('GET /items/:id/messages error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// POST /api/items/:id/messages { body }
router.post('/items/:id/messages', authMiddleware, async (req, res) => {
  try {
    const itemId = req.params.id
    const { body } = req.body || {}
    if (!body || !body.trim()) return res.status(400).json({ error: 'body required' })

    // optional: verify item exists
    let col
    try { col = await mongo.getCollection(ITEMS) } catch (e) { return res.status(503).json({ error: 'database unavailable' }) }
    const item = await col.findOne({ id: itemId })
    if (!item) return res.status(404).json({ error: 'item not found' })

    // Only allow sending messages if user is reporter or claimer (or admin).
    // If there's no claimer yet, allow any authenticated user to post to ask about the item.
    const uid = req.user && req.user.id
    const isAdmin = req.user && req.user.isAdmin
    const isReporter = uid && item.reportedBy && uid === item.reportedBy
    const hasClaimer = !!(item.claimerId || item.claimer)
    const isClaimer = uid && (
      (item.claimerId && uid === item.claimerId) ||
      (item.claimer && (item.claimer === req.user.name || item.claimer === req.user.email || item.claimer === uid))
    )
    if (!hasClaimer) {
      if (!uid && !isAdmin) return res.status(401).json({ error: 'authentication required' })
    } else {
      if (!isAdmin && !isReporter && !isClaimer) return res.status(403).json({ error: 'forbidden' })
    }

    // insert message
    let mcol
    try { mcol = await mongo.getCollection(COLL) } catch (e) { return res.status(503).json({ error: 'database unavailable' }) }
    const msg = {
      id: nanoid(),
      itemId,
      senderId: req.user && req.user.id,
      senderName: req.user && (req.user.name || req.user.email) || 'Unknown',
      body: body.trim(),
      createdAt: new Date().toISOString()
    }
    await mcol.insertOne(msg)
    return res.status(201).json(msg)
  } catch (err) {
    console.error('POST /items/:id/messages error', err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
