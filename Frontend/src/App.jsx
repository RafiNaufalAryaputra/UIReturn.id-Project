import './App.css'
import { useState, useEffect } from 'react'
import ReportForm from './ReportForm'
import Search from './Search'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import Contact from './pages/Contact'
import Header from './components/Header'
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

  const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

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
                  found: !!it.found
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
            found: item.found === 'found'
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
      <Header view={view} setView={setView} />

  <main className="container mx-auto px-6 py-8 flex-1">
        {view === 'home' && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
                <h1 className="mt-7 text-4xl lg:text-5xl font-extrabold leading-tight">Sistem Pencarian Barang Hilang <span className="text-accent-dark">UI</span></h1>
                <p className="mt-3 text-slate-600 text-lg">Platform terpusat untuk melaporkan dan mencari barang hilang di lingkungan Universitas Indonesia. Mudah digunakan, aman, dan cepat.</p>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => setView('report')}
                    className="px-5 py-3 bg-accent-dark text-white rounded-lg shadow-lg transform hover:-translate-y-0.5 transition">Laporkan Barang</button>
                  <button onClick={() => setView('search')} className="px-5 py-3 border border-slate-200 rounded-lg">Cari Barang</button>
                </div>

                <div className="mt-6 bg-gradient-to-r from-white to-[rgba(255,250,240,0.6)] rounded-lg shadow-lg overflow-hidden border border-amber-50">
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <h4 className="font-medium text-lg">Pencarian Cepat</h4>
                      <p className="text-sm text-slate-600 mt-2">Cari berdasarkan judul, deskripsi, atau lokasi. Gunakan kata kunci seperti ‘dompet’, ‘kunci’, atau nama gedung.</p>
                      <div className="mt-3">
                        <input placeholder="Cari berdasarkan judul, deskripsi, lokasi..." onChange={e=>{}} className="mt-2 p-3 border rounded-lg shadow-sm focus:ring-4 focus:ring-accent/30 focus:bg-accent-dark focus:text-white placeholder-slate-400 focus:placeholder-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="illustration">
                        <div className="illus-card">
                          <div className="illus-header">Laporan terbaru</div>
                          <ul className="illus-list">
                            <li><span className="illus-dot"/>Dompet — Fakultas Teknik</li>
                            <li><span className="illus-dot"/>Payung — Perpustakaan</li>
                            <li><span className="illus-dot"/>Kunci motor — Parkiran Selatan</li>
                          </ul>
                          <div className="illus-foot">Lebih dari <strong>{items.length}</strong> laporan</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-lg">Fitur Unggulan</h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-accent-light rounded">
                    <div className="font-semibold">Laporkan Cepat</div>
                    <div className="text-sm text-slate-600 mt-1">Form sederhana untuk mencatat detail barang.</div>
                  </div>
                  <div className="p-3 bg-accent-light rounded">
                    <div className="font-semibold">Pencarian Terpusat</div>
                    <div className="text-sm text-slate-600 mt-1">Cari berdasarkan judul, deskripsi, lokasi.</div>
                  </div>
                  <div className="p-3 bg-accent-light rounded">
                    <div className="font-semibold">Klaim & Verifikasi</div>
                    <div className="text-sm text-slate-600 mt-1">Alur klaim dan notifikasi sederhana.</div>
                  </div>
                  <div className="p-3 bg-accent-light rounded">
                    <div className="font-semibold">Aman & Terkelola</div>
                    <div className="text-sm text-slate-600 mt-1">Data tersimpan dan mudah diaudit.</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <h4 className="font-medium">Statistik Singkat</h4>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold">{items.length}</div>
                    <div className="text-xs text-slate-500">Total Laporan</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{items.filter(i=>i.found).length}</div>
                    <div className="text-xs text-slate-500">Barang Ditemukan</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{items.filter(i=>i.claimed).length}</div>
                    <div className="text-xs text-slate-500">Sudah Diklaim</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'report' && (
          <section className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Laporkan Barang</h2>
            <div className="bg-white rounded shadow p-6">
              <ReportForm onSubmit={addItem} onCancel={() => setView('home')} />
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
