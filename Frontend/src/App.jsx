import './App.css'
import { useState, useEffect } from 'react'
import ReportForm from './pages/ReportForm'
import Search from './pages/Search'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import Contact from './pages/Contact'
import Header from './components/Header'
import Login from './pages/Login'
import Register from './pages/Register'
import Footer from './components/Footer'

function App() {
  const [view, setView] = useState('home') // home | report | search | about | how | contact
  const [items, setItems] = useState([])

  // toast notification
  const [toast, setToast] = useState({ show: false, message: '' })
  function showToast(message, ms = 3000) {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), ms)
  }

  const API = import.meta.env.VITE_API || 'http://localhost:3000'

  // auth
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      const t = localStorage.getItem('token')
      const u = localStorage.getItem('user')
      if (t) setToken(t)
      if (u) setUser(JSON.parse(u))
    } catch (e) {}
  }, [])

  function handleLogin(t, u) {
    try { localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)) } catch (e) {}
    setToken(t)
    setUser(u)
    setView('home')
  }

  function handleLogout() {
    try { localStorage.removeItem('token'); localStorage.removeItem('user') } catch (e) {}
    setToken(null)
    setUser(null)
    setView('home')
  }

  // on mount: try to fetch from backend; if backend available, load server items and
  // migrate any localStorage items to backend. Otherwise fall back to localStorage.
  useEffect(() => {
    let mounted = true
    async function init() {
      const rawLocal = (() => { try { return JSON.parse(localStorage.getItem('uireturn_items') || '[]') } catch { return [] } })()
      try {
        const res = await fetch(`${API}/api/items`)
        if (!res.ok) throw new Error('backend not ready')
        const serverItems = await res.json()
        if (!mounted) return
        // If server has items, use them. If server empty but local has items, migrate local -> server
        if ((serverItems?.length || 0) === 0 && (rawLocal?.length || 0) > 0) {
          // migrate local items to server
          for (const it of rawLocal) {
            try {
              await fetch(`${API}/api/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: it.title,
                  description: it.description,
                  location: it.location,
                  contact: it.contact,
                    found: !!it.found,
                    imageData: it.imageData || null
                })
              })
            } catch (err) {
              console.warn('migration post failed', err)
            }
          }
          showToast('Migrasi data lokal ke server selesai')
        }
        // refresh items from server
        const res2 = await fetch(`${API}/api/items`)
        if (res2.ok) {
          const fresh = await res2.json()
          if (mounted) setItems(fresh)
          // clear localStorage since server now holds data
          try { localStorage.removeItem('uireturn_items') } catch {}
        } else {
          // fallback to local
          if (mounted) setItems(rawLocal)
        }
      } catch (err) {
        // backend not reachable, use localStorage
        if (mounted) {
          try {
            const raw = localStorage.getItem('uireturn_items')
            setItems(raw ? JSON.parse(raw) : [])
          } catch (e) { setItems([]) }
        }
      }
    }
    init()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('uireturn_items', JSON.stringify(items))
    } catch (e) {
      // ignore storage errors
    }
  }, [items])

  function addItem(item) {
    ;(async () => {
      // try to POST to backend; if it fails, fall back to local-only
      try {
        const res = await fetch(`${API}/api/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item.title,
            description: item.description,
            location: item.location,
            contact: item.contact,
            found: item.found === 'found',
            imageData: item.imageData || null
          })
        })
        if (res.ok) {
          const saved = await res.json()
          setItems(prev => [saved, ...prev])
          showToast('Laporan berhasil dikirim ke server ✔')
        } else {
          throw new Error('server responded ' + res.status)
        }
      } catch (err) {
        // fallback to local-only
        const newItem = {
          id: Date.now(),
          title: item.title,
          description: item.description,
          location: item.location,
          contact: item.contact,
          found: item.found === 'found',
          imageData: item.imageData || null,
          createdAt: new Date().toISOString(),
          claimed: false,
        }
        setItems(prev => [newItem, ...prev])
        showToast('Laporan disimpan secara lokal (server tak tersedia)')
      }
      setView('search')
    })()
  }

  function claimItem(id, claimer) {
    ;(async () => {
      try {
        const res = await fetch(`${API}/api/items/${id}/claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ claimer })
        })
        if (res.ok) {
          const updated = await res.json()
          setItems(prev => prev.map(it => (it.id === updated.id ? updated : it)))
          showToast('Klaim diterima — terima kasih')
          return
        }
        throw new Error('server claim failed')
      } catch (err) {
        // fallback: update locally
        setItems(prev => prev.map(it => (it.id === id ? { ...it, claimed: true, claimer } : it)))
        showToast('Klaim dicatat secara lokal (server tak tersedia)')
      }
    })()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-accent-light to-white text-slate-900">
      <Header view={view} setView={setView} user={user} onLogout={handleLogout} />

  <main className="max-w-screen-lg mx-auto px-8 py-10 flex-1">
        {view === 'home' && (
          <section className="space-y-10">
            {/* Hero */}
            <div className="bg-gradient-to-b from-white via-accent-light to-white rounded-xl p-10 shadow-lg">
              <div className="max-w-screen-lg mx-auto flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">Selamat Datang di <span className="text-amber-600">UIReturn.id</span></h1>
                  <p className="mt-3 text-slate-600 text-base lg:text-lg max-w-2xl">Platform Lost & Found resmi untuk komunitas Universitas Indonesia. Laporkan barang hilang atau temukan barang dengan mudah dan aman.</p>
                  <div className="mt-5 flex justify-center md:justify-start gap-3">
                    <button onClick={() => setView('report')} className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow transition">Laporkan Barang</button>
                    <button onClick={() => setView('search')} className="px-5 py-3 border rounded-lg bg-white">Cari Barang</button>
                  </div>
                  <div className="mt-5 text-sm text-slate-500">Gratis, aman, dan terintegrasi dengan sistem kampus.</div>
                </div>
                <div className="w-full md:w-1/3">
                  <div className="bg-white rounded-lg shadow-md p-4 border">
                    <div className="text-sm text-slate-500">Laporan terbaru</div>
                    <ul className="mt-3 space-y-2 text-sm">
                      {items.slice(0,3).map(it => (
                        <li key={it.id} className="flex items-start gap-3">
                          <div className="mt-1 w-3 h-3 rounded-full bg-amber-400"/> 
                          <div className="flex-1 text-sm">{it.title} — <span className="text-slate-500">{it.location}</span></div>
                        </li>
                      ))}
                      {items.length === 0 && <li className="text-slate-500">Belum ada laporan</li>}
                    </ul>
                    <div className="mt-4 text-xs text-slate-400">Lebih dari <strong>{items.length}</strong> laporan</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features + Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
                <h3 className="text-2xl font-semibold mb-5">Fitur Unggulan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-5">
                  <div className="p-4 bg-amber-50 rounded-lg flex items-start gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-xl">📝</div>
                    <div>
                      <div className="font-semibold">Laporkan Cepat</div>
                      <div className="text-sm text-slate-500">Form singkat untuk mencatat detail barang yang hilang atau ditemukan.</div>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg flex items-start gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-xl">🔎</div>
                    <div>
                      <div className="font-semibold">Pencarian Terpusat</div>
                      <div className="text-sm text-slate-500">Cari berdasarkan judul, deskripsi, atau lokasi.</div>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg flex items-start gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-xl">🤝</div>
                    <div>
                      <div className="font-semibold">Klaim & Verifikasi</div>
                      <div className="text-sm text-slate-500">Proses klaim yang jelas dan mudah diverifikasi.</div>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg flex items-start gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-xl">🔒</div>
                    <div>
                      <div className="font-semibold">Aman & Terkelola</div>
                      <div className="text-sm text-slate-500">Data tersimpan dan mudah diaudit oleh pengelola kampus.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-medium mb-4">Statistik</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl md:text-4xl font-bold text-amber-600">{items.length}</div>
                      <div className="text-xs text-slate-500 mt-2">Total Laporan</div>
                    </div>
                    <div>
                      <div className="text-3xl md:text-4xl font-bold text-amber-600">{items.filter(i=>i.found).length}</div>
                      <div className="text-xs text-slate-500 mt-2">Barang Ditemukan</div>
                    </div>
                    <div>
                      <div className="text-3xl md:text-4xl font-bold text-amber-600">{items.filter(i=>i.claimed).length}</div>
                      <div className="text-xs text-slate-500 mt-2">Sudah Diklaim</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3 justify-center md:justify-end">
                  <button onClick={() => setView('report')} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded">Laporkan</button>
                  <button onClick={() => setView('search')} className="px-4 py-2 border rounded">Cari</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'report' && (
          <section className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Laporkan Barang</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded shadow p-6">
                <ReportForm onSubmit={addItem} onCancel={() => setView('home')} />
              </div>

              <aside className="md:col-span-1">
                <div className="bg-white rounded shadow p-6 space-y-4">
                  <div className="text-sm text-slate-600">Tips Pengisian</div>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-2">
                    <li>Isi judul singkat dan jelas (mis. "Dompet hitam").</li>
                    <li>Berikan deskripsi yang detail dan akurat.</li>
                    <li>Tambahkan lokasi terakhir atau tempat ditemukan.</li>
                    <li>Unggah foto jika memungkinkan untuk mempercepat verifikasi.</li>
                    <li>Berikan kontak yang mudah dihubungi.</li>
                  </ul>

                  <div className="pt-4">
                    <div className="text-sm text-slate-600 mb-2">Laporan Terbaru</div>
                    <div className="space-y-2 text-sm">
                      {items.slice(0,5).map(it => (
                        <div key={it.id} className="p-2 rounded border bg-slate-50">{it.title} <div className="text-xs text-slate-500">{it.location}</div></div>
                      ))}
                      {items.length === 0 && <div className="text-slate-500">Belum ada laporan</div>}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}

        {view === 'search' && (
          <section className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Cari Barang</h2>
            <div className="bg-white rounded shadow p-6">
              <Search items={items} onClaim={claimItem} onReport={() => setView('report')} />
            </div>
          </section>
        )}

        {view === 'login' && (
          <section className="mt-6">
            <Login onLogin={handleLogin} onGotoRegister={() => setView('register')} />
          </section>
        )}

        {view === 'register' && (
          <section className="mt-6">
            <Register onRegistered={() => setView('login')} onGotoLogin={() => setView('login')} />
          </section>
        )}

        {view === 'about' && (
          <section className="mt-6">
            <About />
          </section>
        )}

        {view === 'how' && (
          <section className="mt-6">
            <HowItWorks />
          </section>
        )}

        {view === 'contact' && (
          <section className="mt-6">
            <Contact />
          </section>
        )}
      </main>

      <Footer />

      {/* toast */}
      <div aria-live="polite" className="pointer-events-none fixed inset-0 flex items-start px-4 py-6 sm:items-start sm:p-6 z-50">
        <div className="w-full flex flex-col items-end">
          <div className={`max-w-sm w-full bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 transition transform ${toast.show ? 'translate-y-0 opacity-100' : 'translate-y-[-10px] opacity-0'}`}>
            <div className="text-sm text-slate-800">{toast.message}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
