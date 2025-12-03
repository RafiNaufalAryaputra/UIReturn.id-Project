import express from 'express'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import mongo from './mongo.js'
import { authMiddleware } from './auth.js'
import dotenv from 'dotenv'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

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

// multer for avatar upload
const uploadsDir = path.join(process.cwd(), 'uploads')
try { fs.mkdirSync(uploadsDir, { recursive: true }) } catch (e) {}
const avatarStorage = multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadsDir), filename: (req, file, cb) => { const ext = path.extname(file.originalname); cb(null, `avatar-${Date.now()}-${nanoid()}${ext}`) } })
const avatarUpload = multer({ storage: avatarStorage, limits: { fileSize: 3 * 1024 * 1024 } })

// GET /api/users/me  (current user profile)
router.get('/me', authMiddleware, async (req, res) => {
	try {
		const id = req.user && req.user.id
		if (!id) return res.status(401).json({ error: 'unauthorized' })
		const col = await mongo.getCollection(COLL)
		const user = await col.findOne({ id })
		if (!user) return res.status(404).json({ error: 'not found' })
		return res.json(userSafe(user))
	} catch (err) {
		console.error('GET /api/users/me error', err)
		res.status(500).json({ error: 'internal' })
	}
})

// PATCH /api/users/me { name }
router.patch('/me', authMiddleware, async (req, res) => {
	try {
		const id = req.user && req.user.id
		const { name } = req.body || {}
		if (!id) return res.status(401).json({ error: 'unauthorized' })
		const col = await mongo.getCollection(COLL)
		const r = await col.findOneAndUpdate({ id }, { $set: { name: name || '' } }, { returnDocument: 'after' })
		if (!r.value) return res.status(404).json({ error: 'not found' })
		return res.json(userSafe(r.value))
	} catch (err) {
		console.error('PATCH /api/users/me error', err)
		res.status(500).json({ error: 'internal' })
	}
})

// PATCH /api/users/me/password { currentPassword, newPassword }
router.patch('/me/password', authMiddleware, async (req, res) => {
	try {
		const id = req.user && req.user.id
		const { currentPassword = '', newPassword = '' } = req.body || {}
		if (!id) return res.status(401).json({ error: 'unauthorized' })
		if (!newPassword) return res.status(400).json({ error: 'newPassword required' })
		const col = await mongo.getCollection(COLL)
		const user = await col.findOne({ id })
		if (!user) return res.status(404).json({ error: 'not found' })
		const ok = await bcrypt.compare(currentPassword || '', user.password || '')
		if (!ok) return res.status(403).json({ error: 'current password incorrect' })
		const hash = await bcrypt.hash(newPassword, 10)
		await col.findOneAndUpdate({ id }, { $set: { password: hash } })
		return res.json({ success: true })
	} catch (err) {
		console.error('PATCH /api/users/me/password error', err)
		res.status(500).json({ error: 'internal' })
	}
})

// POST /api/users/me/avatar (multipart: file)
router.post('/me/avatar', authMiddleware, avatarUpload.single('file'), async (req, res) => {
	try {
		const id = req.user && req.user.id
		if (!id) return res.status(401).json({ error: 'unauthorized' })
		if (!req.file) return res.status(400).json({ error: 'file required' })
		const col = await mongo.getCollection(COLL)
		const avatarUrl = `/uploads/${req.file.filename}`
		const r = await col.findOneAndUpdate({ id }, { $set: { avatar: avatarUrl } }, { returnDocument: 'after' })
		if (!r.value) return res.status(404).json({ error: 'not found' })
		return res.json(userSafe(r.value))
	} catch (err) {
		console.error('POST /api/users/me/avatar error', err)
		res.status(500).json({ error: 'internal' })
	}
})

// GET /api/users/me/items -> items reported by this user
router.get('/me/items', authMiddleware, async (req, res) => {
	try {
		const id = req.user && req.user.id
		if (!id) return res.status(401).json({ error: 'unauthorized' })
		const col = await mongo.getCollection('items')
		const items = await col.find({ reportedBy: id }).sort({ createdAt: -1 }).toArray()
		return res.json(items)
	} catch (err) {
		console.error('GET /api/users/me/items error', err)
		res.status(500).json({ error: 'internal' })
	}
})

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

export default router
