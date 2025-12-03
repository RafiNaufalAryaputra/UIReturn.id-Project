import mongo from './mongo.js'
import dotenv from 'dotenv'

dotenv.config()

async function run() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: node makeAdmin.js <email>')
    process.exit(1)
  }
  try {
    await mongo.connect()
    const col = await mongo.getCollection('users')
    const r = await col.findOneAndUpdate({ email: email.toLowerCase() }, { $set: { isAdmin: true } }, { returnDocument: 'after' })
    if (!r.value) {
      console.error('User not found')
      process.exit(2)
    }
    console.log('Promoted to admin:', r.value.email)
    process.exit(0)
  } catch (err) {
    console.error('Error', err)
    process.exit(3)
  }
}

run()
