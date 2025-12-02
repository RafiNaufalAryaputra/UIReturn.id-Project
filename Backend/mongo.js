import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const URI = process.env.MONGODB_URI
let client
let db

export async function connect() {
  if (client && client.topology && client.topology.isConnected && client.topology.isConnected()) return
  if (!URI) throw new Error('MONGODB_URI not set')
  client = new MongoClient(URI)
  await client.connect()
  // use database from URI or default to 'uireturn'
  const dbName = (new URL(URI)).pathname.replace('/', '') || 'uireturn'
  db = client.db(dbName)
  console.log('[mongo] connected to', dbName)
}

export async function getCollection(name) {
  if (!db) throw new Error('mongo not connected')
  return db.collection(name)
}

export async function close() {
  if (client) await client.close()
  client = null
  db = null
}

export default { connect, getCollection, close }
