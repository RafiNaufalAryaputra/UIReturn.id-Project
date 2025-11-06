import fs from 'fs/promises'
import { join, dirname } from 'path'

// Simple file-backed DB replacement for lowdb to avoid package export issues.
import { fileURLToPath } from 'url'
const __dirname = dirname(fileURLToPath(import.meta.url))
const file = join(__dirname, 'db.json')

const state = { data: null }

async function ensureFile() {
	try {
		await fs.access(file)
	} catch (e) {
		// create directory and initial file if missing
		await fs.mkdir(dirname(file), { recursive: true })
		await fs.writeFile(file, JSON.stringify({ items: [] }, null, 2))
	}
}

async function read() {
	await ensureFile()
	const raw = await fs.readFile(file, 'utf8')
	try {
		state.data = JSON.parse(raw)
	} catch (e) {
		state.data = { items: [] }
	}
	if (!state.data.items) state.data.items = []
}

async function write() {
	try {
		await fs.writeFile(file, JSON.stringify(state.data || { items: [] }, null, 2))
		// debug log to help trace when writes happen
		console.log(`[db] wrote ${file} (${(state.data?.items?.length ?? 0)} items)`)
	} catch (err) {
		console.error('[db] write error', err)
		throw err
	}
}

export default {
	read,
	write,
	get data() {
		return state.data
	},
	set data(v) {
		state.data = v
	}
}
