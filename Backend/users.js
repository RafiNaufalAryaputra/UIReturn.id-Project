import express from 'express'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongo from './mongo.js'
import { authMiddleware } from './auth.js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()
const COLL = 'users'
const JWT_SECRET = process.env.JWT_SECRET || 'please-change-me'

function userSafe(u) {
  const { password, ...rest } = u
  return rest
}

// POST /api/users/register { name, email, password }
router.post('/register', async (req, res) => {
	try {
		const { name = '', email = '', password = '' } = req.body || {}
		if (!email || !password) return res.status(400).json({ error: 'email and password required' })
		let col
		try { col = await mongo.getCollection(COLL) } catch (e) { return res.status(503).json({ error: 'database unavailable' }) }

		const existing = await col.findOne({ email: email.toLowerCase() })
		if (existing) return res.status(409).json({ error: 'email taken' })

		const hash = await bcrypt.hash(password, 10)
		const user = { id: nanoid(), name, email: email.toLowerCase(), password: hash, isAdmin: false, createdAt: new Date().toISOString() }
		await col.insertOne(user)
		res.status(201).json(userSafe(user))
	} catch (err) {
		console.error('POST /api/users/register error', err)
		res.status(500).json({ error: 'internal' })
	}
})

// POST /api/users/login { email, password }
router.post('/login', async (req, res) => {
	try {
		const { email = '', password = '' } = req.body || {}
		if (!email || !password) return res.status(400).json({ error: 'email and password required' })
		let col
		try { col = await mongo.getCollection(COLL) } catch (e) { return res.status(503).json({ error: 'database unavailable' }) }

		const user = await col.findOne({ email: email.toLowerCase() })
		if (!user) return res.status(401).json({ error: 'invalid credentials' })
		const ok = await bcrypt.compare(password, user.password || '')
		if (!ok) return res.status(401).json({ error: 'invalid credentials' })
		const token = jwt.sign({ id: user.id, email: user.email, name: user.name, isAdmin: !!user.isAdmin }, JWT_SECRET, { expiresIn: '7d' })
		res.json({ token, user: userSafe(user) })
	} catch (err) {
		console.error('POST /api/users/login error', err)
		res.status(500).json({ error: 'internal' })
	}
})

export default router

// GET /api/users/:id  (protected — require auth)
router.get('/:id', authMiddleware, async (req, res) => {
	try {
		const id = req.params.id
		let col
		try { col = await mongo.getCollection(COLL) } catch (e) { return res.status(503).json({ error: 'database unavailable' }) }
		const user = await col.findOne({ id })
		if (!user) return res.status(404).json({ error: 'not found' })
		const { password, ...rest } = user
		// only expose limited fields
		return res.json({ id: rest.id, name: rest.name, email: rest.email, createdAt: rest.createdAt, isAdmin: !!rest.isAdmin })
	} catch (err) {
		console.error('GET /api/users/:id error', err)
		res.status(500).json({ error: 'internal' })
	}
})
