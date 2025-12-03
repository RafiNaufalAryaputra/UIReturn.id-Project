import { useState, useEffect } from 'react'
import DirectChat from '../components/DirectChat'

export default function Messages({ user }) {
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const API = import.meta.env.VITE_API || 'http://localhost:3000'

  useEffect(() => {
    if (!user) return
    fetchConversations()
    // if another view asked to open DM with someone, check localStorage
    try {
      const openWith = localStorage.getItem('open_dm_with')
      if (openWith) {
        setSelected(openWith)
        localStorage.removeItem('open_dm_with')
      }
    } catch (e) {}
  }, [user])

  async function fetchConversations() {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/dm/conversations`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      if (!res.ok) return
      const data = await res.json()
      setConversations(data)
    } catch (err) {
      // ignore
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold mb-4">Pesan Pribadi</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 bg-white rounded shadow p-4">
          <div className="text-sm text-slate-600 mb-3">Percakapan</div>
          {conversations.length === 0 ? (
            <div className="text-xs text-slate-500">Belum ada percakapan</div>
          ) : (
            <ul className="space-y-2">
              {conversations.map(c => (
                <li key={c.otherId}>
                  <button onClick={() => setSelected(c.otherId)} className={`w-full text-left p-2 rounded ${selected===c.otherId ? 'bg-accent-light text-accent-dark' : 'hover:bg-slate-50'}`}>
                    <div className="font-medium">{c.otherId}</div>
                    <div className="text-xs text-slate-500">{c.lastMessage}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <main className="md:col-span-3 bg-white rounded shadow p-4">
          {selected ? (
            <DirectChat otherId={selected} user={user} />
          ) : (
            <div className="text-sm text-slate-600">Pilih percakapan untuk mulai ngobrol</div>
          )}
        </main>
      </div>
    </div>
  )
}
