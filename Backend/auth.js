import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-me'

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  const token = header && header.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'unauthorized' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'unauthorized' })
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' })
  if (!req.user.isAdmin) return res.status(403).json({ error: 'forbidden' })
  return next()
}

export default { authMiddleware, requireAdmin }
