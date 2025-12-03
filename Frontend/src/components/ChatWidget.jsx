import { useState, useEffect, useRef } from 'react'
import DirectChat from './DirectChat'

export default function ChatWidget({ user }) {
  const [open, setOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [unread, setUnread] = useState(0)
  const [selected, setSelected] = useState(null)
  const [selectedDisplayName, setSelectedDisplayName] = useState(null)
  const [initialMessage, setInitialMessage] = useState('')
  const mounted = useRef(true)
  const API = import.meta.env.VITE_API || 'http://localhost:3000'
  const pollRef = useRef(null)
  const lastUnreadRef = useRef(0)

  // allow other components to open the chat via window event
  useEffect(() => {
    function onOpenChat(e) {
      const otherId = e && e.detail && e.detail.otherId
      const initial = e && e.detail && e.detail.initialMessage
      if (otherId) setSelected(otherId)
      if (initial) setInitialMessage(initial)
      setOpen(true)
    }
    window.addEventListener('openChat', onOpenChat)
    return () => window.removeEventListener('openChat', onOpenChat)
  }, [])

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    if (!open) return
    fetchConversations()
  }, [open, user])

  // when a selected user exists but not in conversations, try to fetch display name
  useEffect(() => {
    let mounted = true
    async function fetchName() {
      if (!selected) { setSelectedDisplayName(null); return }
      // if known in conversations, use that
      const found = conversations.find(c => c.otherId === selected)
      if (found) { setSelectedDisplayName(found.otherId); return }
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API}/api/users/${selected}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
        if (!res.ok) { setSelectedDisplayName(selected); return }
        const data = await res.json()
        if (mounted) setSelectedDisplayName(data.name || data.email || selected)
      } catch (err) { if (mounted) setSelectedDisplayName(selected) }
    }
    fetchName()
    return () => { mounted = false }
  }, [selected, conversations])

  useEffect(() => {
    // poll unread count
    async function poll() {
      try {
        const token = localStorage.getItem('token')
        if (!token) { setUnread(0); return }
        const res = await fetch(`${API}/api/dm/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const data = await res.json()
        const n = data.unread || 0
        setUnread(n)
        if (n > lastUnreadRef.current) {
          // notify
          try { if (window.Notification && Notification.permission === 'granted') new Notification('UIReturn.id', { body: `Anda memiliki ${n} pesan belum dibaca` }) } catch (e) {}
          try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.type = 'sine'; o.frequency.value = 600; g.gain.value = 0.02; o.start(); setTimeout(()=>{ o.stop(); ctx.close() }, 150) } catch (e) {}
        }
        lastUnreadRef.current = n
      } catch (err) {}
    }
    poll()
    pollRef.current = setInterval(poll, 10000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [user])

  async function fetchConversations() {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/dm/conversations`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      if (!res.ok) return
      const data = await res.json()
      // enrich conversations with display names by fetching user info in parallel
      const enriched = await Promise.all(data.map(async (c) => {
        try {
          const r = await fetch(`${API}/api/users/${c.otherId}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
          if (!r.ok) return { ...c, displayName: c.otherId }
          const u = await r.json()
          return { ...c, displayName: u.name || u.email || c.otherId }
        } catch (e) { return { ...c, displayName: c.otherId } }
      }))
      if (mounted.current) setConversations(enriched)
    } catch (err) {}
  }

  return (
    <div>
      {/* Floating button */}
      <div className="fixed right-4 bottom-4 z-50">
        <button onClick={() => setOpen(v => !v)} className="relative flex items-center gap-2 px-4 py-2 bg-accent-dark text-white rounded-full shadow-lg hover:shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H8l-6 3V5z" />
          </svg>
          <span className="hidden sm:inline">Chat</span>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">{unread}</span>
          )}
        </button>
      </div>

      {/* Popup panel */}
      {open && (
        <div className={fullscreen ? "fixed inset-0 z-50 p-4" : "fixed right-4 bottom-20 z-50"}>
          <div className={`${fullscreen ? 'w-full h-full' : 'w-96 h-[70vh]'} bg-white rounded shadow-lg overflow-hidden flex flex-col`}>
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <div className="font-medium">Pesan Pribadi</div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setFullscreen(f => !f) }} title={fullscreen ? 'Restore' : 'Perbesar'} className="text-sm text-slate-500 hover:text-slate-700">
                  {fullscreen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 6h8v2H8v6H6V6z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M3 3h6v2H5v4H3V3zm14 0v6h-2V5h-4V3h6zM3 17v-6h2v4h4v2H3zm14 0h-6v-2h4v-4h2v6z" />
                    </svg>
                  )}
                </button>
                <button onClick={() => { setOpen(false); setFullscreen(false) }} className="text-sm text-slate-500 hover:text-slate-700">Tutup</button>
              </div>
            </div>

            <div className="flex-1 flex">
              <aside className={`${fullscreen ? 'w-48' : 'w-36'} border-r overflow-auto`}>
                <div className="p-2 text-xs text-slate-500">Percakapan</div>
                {conversations.length === 0 && !selected ? (
                  <div className="p-2 text-xs text-slate-400">Belum ada percakapan</div>
                ) : (
                  <ul>
                    {/* If there is a selected otherId not in conversations, show it first so user can chat */}
                    {selected && !conversations.find(c => c.otherId === selected) && (
                      <li key={"_sel"}>
                        <button onClick={() => setSelected(selected)} className={`w-full text-left p-2 text-xs ${'bg-accent-light text-accent-dark'}`}>
                          <div className="font-medium truncate">{selected}</div>
                          <div className="text-[10px] text-slate-500 truncate">(Percakapan baru)</div>
                        </button>
                      </li>
                    )}
                    {conversations.map(c => (
                      <li key={c.otherId}>
                        <button onClick={() => setSelected(c.otherId)} className={`w-full text-left p-2 text-xs ${selected===c.otherId ? 'bg-accent-light text-accent-dark' : 'hover:bg-slate-50'}`}>
                          <div className="font-medium truncate">{c.displayName || c.otherId}</div>
                          <div className="text-[10px] text-slate-500 truncate">{c.lastMessage}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>

              <main className="flex-1 p-3 overflow-auto">
                {selected ? (
                    <DirectChat otherId={selected} user={user} initialText={initialMessage} />
                  ) : (
                    <div className="text-sm text-slate-600">Pilih percakapan untuk mulai ngobrol</div>
                  )}
              </main>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
