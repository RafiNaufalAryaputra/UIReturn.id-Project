import { useState } from 'react'

export default function ReportForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [contact, setContact] = useState('')
  const [found, setFound] = useState('lost') // 'lost' or 'found'

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return alert('Judul wajib diisi')
    onSubmit({ title, description, location, contact, found })
    // reset
    setTitle('')
    setDescription('')
    setLocation('')
    setContact('')
    setFound('lost')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col">
          <span className="text-sm text-slate-600 font-medium">Jenis</span>
          <select value={found} onChange={e => setFound(e.target.value)} className="mt-2 p-3 border rounded-lg shadow-sm focus:ring-1 focus:ring-accent/30 focus:bg-accent-dark focus:text-white">
            <option value="lost">Hilangan</option>
            <option value="found">Ditemukan</option>
          </select>
        </label>

        <label className="flex flex-col md:col-span-2">
          <span className="text-sm text-slate-600 font-medium">Judul</span>
          <input value={title} onChange={e => setTitle(e.target.value)} className="mt-2 p-3 border rounded-lg shadow-sm focus:ring-4 focus:ring-accent/30 focus:bg-accent-dark focus:text-white placeholder-slate-400 focus:placeholder-white" placeholder="Contoh: Dompet hitam" />
        </label>
      </div>

      <label className="flex flex-col">
        <span className="text-sm text-slate-600 font-medium">Deskripsi</span>
  <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-2 p-3 border rounded-lg shadow-sm focus:ring-4 focus:ring-accent/30 focus:bg-accent-dark focus:text-white placeholder-slate-400 focus:placeholder-white" rows={5} placeholder="Detail barang, ciri-ciri, dll." />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col">
          <span className="text-sm text-slate-600 font-medium">Lokasi terakhir / ditemukan</span>
          <input value={location} onChange={e => setLocation(e.target.value)} className="mt-2 p-3 border rounded-lg shadow-sm focus:ring-4 focus:ring-accent/30 focus:bg-accent-dark focus:text-white placeholder-slate-400 focus:placeholder-white" placeholder="Contoh: Perpustakaan, Lantai 2" />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-slate-600 font-medium">Kontak (opsional)</span>
          <input value={contact} onChange={e => setContact(e.target.value)} className="mt-2 p-3 border rounded-lg shadow-sm focus:ring-4 focus:ring-accent/30 focus:bg-accent-dark focus:text-white placeholder-slate-400 focus:placeholder-white" placeholder="Email atau nomor HP" />
        </label>
      </div>

      <div className="flex gap-3 items-center">
        <button type="submit" className="px-4 py-2 bg-accent-dark text-white rounded-lg shadow-lg hover:brightness-95 transition">Kirim Laporan</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg">Batal</button>
        <div className="ml-auto text-sm text-slate-500">Pastikan informasi benar sebelum submit.</div>
      </div>
    </form>
  )
}
