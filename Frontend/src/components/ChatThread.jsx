import { useState, useEffect, useRef } from 'react'

export default function ChatThread({ itemId, user }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [authorized, setAuthorized] = useState(true)
  const mounted = useRef(true)
  const pollRef = useRef(null)

  const API = import.meta.env.VITE_API || 'http://localhost:3000'

  useEffect(() => {
    mounted.current = true
    fetchMessages()
    // poll every 3s
    pollRef.current = setInterval(fetchMessages, 3000)
    return () => { mounted.current = false; clearInterval(pollRef.current) }
  }, [itemId])

  async function fetchMessages() {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/items/${itemId}/messages`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      if (!res.ok) {
        if (mounted.current) {
          if (res.status === 401 || res.status === 403) {
            setAuthorized(false)
            setMessages([])
          }
        }
        return
      }
      const data = await res.json()
      if (mounted.current) {
        setMessages(data)
        setAuthorized(true)
      }
    } catch (err) {
      // ignore
    }
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) return alert('Silakan login untuk mengirim pesan')
      const res = await fetch(`${API}/api/items/${itemId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body: text.trim() })
      })
      if (res.ok) {
        const saved = await res.json()
        setMessages(prev => [...prev, saved])
        setText('')
      } else {
        if (res.status === 401 || res.status === 403) {
          setAuthorized(false)
          setMessages([])
          alert('Obrolan bersifat pribadi. Silakan login atau Anda tidak memiliki akses.')
        } else {
          const err = await res.json().catch(() => ({}))
          alert(err.error || 'Gagal mengirim pesan')
        }
      }
    } catch (err) {
      alert('Gagal mengirim pesan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <div className="text-sm text-slate-600 mb-2">Obrolan terkait laporan</div>
      <div className="bg-slate-50 p-3 rounded max-h-64 overflow-auto">
        {messages.length === 0 ? (
          <div className="text-xs text-slate-500">Belum ada pesan. Jadilah yang pertama menghubungi.</div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`mb-2 ${m.senderId === (user && user.id) ? 'text-right' : 'text-left'}`}>
              <div className="text-xs text-slate-500">{m.senderName}</div>
              <div className="inline-block bg-white p-2 rounded shadow text-sm">{m.body}</div>
              <div className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>

      {!authorized ? (
        <div className="mt-3 text-sm text-slate-600">Obrolan ini bersifat pribadi — hanya dapat diakses oleh pelapor dan pemohon klaim.</div>
      ) : (
        <form onSubmit={sendMessage} className="mt-3 flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} className="flex-1 p-2 border rounded" placeholder={user ? 'Tulis pesan...' : 'Silakan login untuk mengirim pesan'} disabled={!user} />
          <button className="px-3 py-1 bg-accent-dark text-white rounded" disabled={!user || loading}>Kirim</button>
        </form>
      )}
    </div>
  )
}
