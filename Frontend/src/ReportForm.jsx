import { useState } from 'react'

export default function ReportForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [contact, setContact] = useState('')
  const [found, setFound] = useState('lost') // 'lost' or 'found'
  const [imageData, setImageData] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return alert('Judul wajib diisi')
    onSubmit({ title, description, location, contact, found, imageData })
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

      <label className="flex flex-col">
        <span className="text-sm text-slate-600 font-medium">Foto (opsional)</span>
        <input type="file" accept="image/*" onChange={async e => {
          const f = e.target.files && e.target.files[0]
          if (!f) { setImageData(null); return }
          // limit size to ~3.5MB to avoid huge base64 strings
          if (f.size > 3500000) return alert('Ukuran file terlalu besar (maks ~3.5MB)')
          const reader = new FileReader()
          reader.onload = () => setImageData(reader.result)
          reader.readAsDataURL(f)
        }} className="mt-2" />
        {imageData && (
          <div className="mt-3 flex items-center gap-4">
            <img src={imageData} alt="preview" className="w-28 h-20 object-cover rounded-md border" />
            <div className="flex flex-col">
              <span className="text-sm text-slate-600">Preview foto</span>
              <button type="button" onClick={() => setImageData(null)} className="mt-2 text-sm text-rose-600 hover:underline">Hapus foto</button>
            </div>
          </div>
        )}

      </label>

      <div className="flex items-center gap-3 justify-end pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200">Batal</button>
        <button type="submit" className="px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600">Kirim Laporan</button>
      </div>

    </form>
  )
}
