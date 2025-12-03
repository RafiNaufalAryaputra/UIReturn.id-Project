import { useState, useEffect, useRef } from 'react'
import DirectChat from './DirectChat'

export default function ChatWidget({ user }) {
  const [open, setOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [unread, setUnread] = useState(0)
  const [selected, setSelected] = useState(null)
  const mounted = useRef(true)
  const API = import.meta.env.VITE_API || 'http://localhost:3000'
  const pollRef = useRef(null)
  const lastUnreadRef = useRef(0)

  // allow other components to open the chat via window event
  useEffect(() => {
    function onOpenChat() { setOpen(true) }
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
      if (mounted.current) setConversations(data)
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
        <div className="fixed right-4 bottom-20 z-50">
          <div className="w-96 h-[70vh] bg-white rounded shadow-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <div className="font-medium">Pesan Pribadi</div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setOpen(false) }} className="text-sm text-slate-500 hover:text-slate-700">Tutup</button>
              </div>
            </div>

            <div className="flex-1 flex">
              <aside className="w-36 border-r overflow-auto">
                <div className="p-2 text-xs text-slate-500">Percakapan</div>
                {conversations.length === 0 ? (
                  <div className="p-2 text-xs text-slate-400">Belum ada percakapan</div>
                ) : (
                  <ul>
                    {conversations.map(c => (
                      <li key={c.otherId}>
                        <button onClick={() => setSelected(c.otherId)} className={`w-full text-left p-2 text-xs ${selected===c.otherId ? 'bg-accent-light text-accent-dark' : 'hover:bg-slate-50'}`}>
                          <div className="font-medium truncate">{c.otherId}</div>
                          <div className="text-[10px] text-slate-500 truncate">{c.lastMessage}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </aside>

              <main className="flex-1 p-3 overflow-auto">
                {selected ? (
                  <DirectChat otherId={selected} user={user} />
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
