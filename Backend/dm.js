import express from 'express'
import { nanoid } from 'nanoid'
import mongo from './mongo.js'
import { authMiddleware } from './auth.js'

const router = express.Router()
const MESSAGES = 'dm_messages'

// GET /api/dm/conversations  -> list conversations for current user
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'unauthorized' })
    const col = await mongo.getCollection(MESSAGES)
    // find distinct conversation partners and last message
    const pipeline = [
      { $match: { $or: [{ senderId: userId }, { receiverId: userId }] } },
      { $project: { otherId: { $cond: [{ $eq: ['$senderId', userId] }, '$receiverId', '$senderId'] }, body: 1, senderId:1, receiverId:1, createdAt:1, senderName:1, read:1 } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$otherId', lastMessage: { $first: '$body' }, lastAt: { $first: '$createdAt' }, lastSender: { $first: '$senderName' }, unreadCount: { $sum: { $cond: [ { $and: [ { $eq: ['$receiverId', userId] }, { $eq: ['$read', false] } ] }, 1, 0 ] } } } },
      { $sort: { lastAt: -1 } }
    ]
    const conv = await col.aggregate(pipeline).toArray()
    return res.json(conv.map(c => ({ otherId: c._id, lastMessage: c.lastMessage, lastAt: c.lastAt, lastSender: c.lastSender, unreadCount: c.unreadCount || 0 })))
  } catch (err) {
    console.error('GET /dm/conversations error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// GET /api/dm/unread-count -> total unread messages for current user
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ error: 'unauthorized' })
    const col = await mongo.getCollection(MESSAGES)
    const count = await col.countDocuments({ receiverId: userId, read: { $ne: true } })
    return res.json({ unread: count })
  } catch (err) {
    console.error('GET /dm/unread-count error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// GET /api/dm/:otherId/messages -> messages between current user and otherId
router.get('/:otherId/messages', authMiddleware, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    const otherId = req.params.otherId
    if (!userId) return res.status(401).json({ error: 'unauthorized' })
    const col = await mongo.getCollection(MESSAGES)
    // mark unread messages (to current user) as read
    await col.updateMany({ senderId: otherId, receiverId: userId, read: { $ne: true } }, { $set: { read: true } })
    const msgs = await col.find({ $or: [ { senderId: userId, receiverId: otherId }, { senderId: otherId, receiverId: userId } ] }).sort({ createdAt: 1 }).toArray()
    return res.json(msgs)
  } catch (err) {
    console.error('GET /dm/:otherId/messages error', err)
    res.status(500).json({ error: 'internal' })
  }
})

// POST /api/dm/:otherId/messages { body }
router.post('/:otherId/messages', authMiddleware, async (req, res) => {
  try {
    const userId = req.user && req.user.id
    const otherId = req.params.otherId
    const { body } = req.body || {}
    if (!userId) return res.status(401).json({ error: 'unauthorized' })
    if (!body || !body.trim()) return res.status(400).json({ error: 'body required' })
    const col = await mongo.getCollection(MESSAGES)
    const msg = { id: nanoid(), senderId: userId, receiverId: otherId, senderName: req.user && (req.user.name || req.user.email) || 'Unknown', body: body.trim(), createdAt: new Date().toISOString(), read: false }
    await col.insertOne(msg)
    return res.status(201).json(msg)
  } catch (err) {
    console.error('POST /dm/:otherId/messages error', err)
    res.status(500).json({ error: 'internal' })
  }
})

export default router
