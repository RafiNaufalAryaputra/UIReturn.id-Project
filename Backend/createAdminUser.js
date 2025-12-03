import mongo from './mongo.js'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

dotenv.config()

async function run() {
  const email = (process.argv[2] || '').toLowerCase()
  const password = process.argv[3]
  const name = process.argv[4] || 'Admin'

  if (!email || !password) {
    console.error('Usage: node createAdminUser.js <email> <password> [name]')
    process.exit(1)
  }

  try {
    await mongo.connect()
    const col = await mongo.getCollection('users')

    const hash = await bcrypt.hash(password, 10)

    const existing = await col.findOne({ email })
    if (existing) {
      const r = await col.findOneAndUpdate({ email }, { $set: { password: hash, isAdmin: true, name } }, { returnDocument: 'after' })
      console.log('Updated existing user to admin:', r.value.email)
      process.exit(0)
    }

    const user = { id: nanoid(), email, name, password: hash, isAdmin: true, createdAt: new Date().toISOString() }
    await col.insertOne(user)
    console.log('Created admin user:', email)
    process.exit(0)
  } catch (err) {
    console.error('Error creating admin user:', err && err.message ? err.message : err)
    process.exit(2)
  }
}

run()
