import { useState } from 'react'
import ItemCard from './components/ItemCard'

export default function Search({ items, onClaim, onReport }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all') // all | lost | found | claimed
  const [sort, setSort] = useState('newest') // newest | oldest
  const [selected, setSelected] = useState(null) // item for claim modal
  const [claimer, setClaimer] = useState('')

  const normalized = items.map(i => ({ ...i, title: i.title || '', description: i.description || '' }))

  let filtered = normalized.filter(it => {
    const query = q.trim().toLowerCase()
    const matchesQ = !query || (it.title || '').toLowerCase().includes(query) ||
      (it.description || '').toLowerCase().includes(query) ||
      (it.location || '').toLowerCase().includes(query)
    if (!matchesQ) return false
    if (filter === 'all') return true
    if (filter === 'claimed') return !!it.claimed
    return filter === 'found' ? !!it.found : !it.found
  })

  filtered = filtered.sort((a, b) => {
    const ta = new Date(a.createdAt || 0).getTime()
    const tb = new Date(b.createdAt || 0).getTime()
    return sort === 'newest' ? tb - ta : ta - tb
  })

  function openClaim(item) {
    setSelected(item)
    setClaimer('')
  }

  const [step, setStep] = useState(1) // 1: form, 2: review, 3: done
  const [agree, setAgree] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function submitClaim() {
    if (!selected) return
    if (!claimer.trim()) return alert('Masukkan nama atau kontak untuk klaim')
    if (!agree) return alert('Harap setujui pernyataan bahwa Anda membawa identitas saat pengambilan')
    // move to review step
    setStep(2)
  }

  async function confirmClaim() {
    if (!selected) return
    setSubmitting(true)
    try {
      await onClaim(selected.id, claimer.trim())
      setStep(3)
      // keep modal open to show instructions; auto-close after short delay
      setTimeout(() => {
        setSelected(null)
        setClaimer('')
        setAgree(false)
        setStep(1)
      }, 3000)
    } catch (err) {
      console.error('claim failed', err)
      alert('Gagal mengirim klaim — coba lagi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
  <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
        {/* Search input: full width on small, spans 2 cols on md+ */}
        <input
          placeholder="Cari sesuai judul, deskripsi, atau lokasi..."
          value={q}
          onChange={e => setQ(e.target.value)}
          className="col-span-full md:col-span-2 w-full p-2 border rounded-lg shadow-sm h-10 focus:ring-4 focus:ring-accent/30 focus:bg-accent-dark focus:text-white placeholder-slate-400 focus:placeholder-white"
        />

        {/* Filter buttons: full width on small, single column on md */}
        <div className="col-span-full md:col-span-3 flex gap-2 items-center">
          <button onClick={() => setFilter('all')} className={`px-2 py-1 rounded ${filter==='all'?'bg-accent-dark text-white':'border'}`}>Semua</button>
          <button onClick={() => setFilter('lost')} className={`px-2 py-1 rounded ${filter==='lost'?'bg-accent-dark text-white':'border'}`}>Hilang</button>
          <button onClick={() => setFilter('found')} className={`px-2 py-1 rounded ${filter==='found'?'bg-accent-dark text-white':'border'}`}>Ditemukan</button>
          <button onClick={() => setFilter('claimed')} className={`px-2 py-1 rounded ${filter==='claimed'?'bg-accent-dark text-white':'border'}`}>Sudah Klaim</button>
        </div>

        {/* Sort + report: full width on small, align right on md */}
        <div className="col-span-full md:col-span-1 flex items-center gap-2 justify-end">
          <select value={sort} onChange={e=>setSort(e.target.value)} className="p-2 border rounded-lg shadow-sm h-10 focus:ring-1 focus:ring-accent/30 focus:bg-accent-dark focus:text-white">
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
          <button onClick={() => onReport && onReport()} className="px-3 py-2 rounded bg-accent-dark text-white">Laporkan</button>
        </div>
      </div>

      <div className="mb-3 text-sm text-slate-600">Menampilkan <strong>{filtered.length}</strong> hasil</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.length === 0 && (
          <div className="p-6 text-center text-slate-600 bg-white rounded shadow col-span-full">Tidak ada hasil. Coba kata kunci lain atau buat laporan.</div>
        )}
        {filtered.map(item => (
          <ItemCard key={item.id} item={item} onClaimClick={openClaim} />
        ))}
      </div>

      {/* Claim modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold">Klaim: {selected.title}</h3>
            <div className="mt-2 text-sm text-slate-600">
              Ikuti langkah berikut untuk mengklaim barang secara prosedural.
            </div>

            {/* Stepper */}
            <div className="mt-4 space-y-4">
              {step === 1 && (
                <div>
                  <div className="text-sm font-medium">Langkah 1 — Identitas & Kontak</div>
                  <p className="text-xs text-slate-500 mt-1">Masukkan nama lengkap atau nomor yang bisa dihubungi. Petugas akan menghubungi Anda untuk verifikasi.</p>
                  <div className="mt-3">
                    <input value={claimer} onChange={e=>setClaimer(e.target.value)} placeholder="Nama atau nomor/WA" className="w-full p-3 border rounded" />
                  </div>

                  <label className="mt-3 flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={agree} onChange={e=>setAgree(e.target.checked)} className="w-4 h-4" />
                    Saya menyatakan akan membawa identitas (KTP/KTM) saat pengambilan barang.
                  </label>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="text-sm font-medium">Langkah 2 — Tinjau & Konfirmasi</div>
                  <div className="mt-2 bg-slate-50 p-3 rounded">
                    <div><strong>Barang:</strong> {selected.title}</div>
                    <div><strong>Lokasi:</strong> {selected.location}</div>
                    <div><strong>Pelapor:</strong> {selected.contact || '—'}</div>
                    <div><strong>Kontak Anda:</strong> {claimer}</div>
                    <div className="text-xs text-slate-500 mt-2">Dengan menekan 'Konfirmasi Klaim' Anda setuju petugas dapat menghubungi Anda untuk verifikasi.</div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center">
                  <div className="text-2xl font-semibold text-emerald-700">Klaim Terkirim ✅</div>
                  <div className="mt-2 text-sm text-slate-600">Petugas akan menghubungi Anda. Bawa identitas saat mengambil barang di lokasi yang ditentukan.</div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <button onClick={()=>{ setSelected(null); setClaimer(''); setAgree(false); setStep(1) }} className="px-4 py-2 border rounded">Tutup</button>
              <div className="flex gap-3">
                {step === 1 && <button onClick={submitClaim} className="px-4 py-2 bg-accent-dark text-white rounded">Lanjut ke Tinjau</button>}
                {step === 2 && <button onClick={confirmClaim} disabled={submitting} className="px-4 py-2 bg-accent-dark text-white rounded">{submitting ? 'Mengirim...' : 'Konfirmasi Klaim'}</button>}
                {step === 3 && <button onClick={()=>{ setSelected(null); setStep(1); setClaimer(''); setAgree(false) }} className="px-4 py-2 bg-accent-dark text-white rounded">Selesai</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
