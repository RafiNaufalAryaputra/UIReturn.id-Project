import { useState, useRef } from 'react'

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
          <span className="text-sm text-slate-600 font-medium">Jenis Laporan</span>
          <select value={found} onChange={e => setFound(e.target.value)} className="mt-2 p-3 border rounded-lg shadow-sm focus:ring-1 focus:ring-accent/30 focus:bg-accent-dark focus:text-white">
            <option value="lost">Kehilangan</option>
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
        <DropzoneImage setImageData={setImageData} imageData={imageData} />
      </label>

      <div className="flex items-center gap-3 justify-end pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200">Batal</button>
        <button type="submit" className="px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600">Kirim Laporan</button>
      </div>

    </form>
  )
}

function DropzoneImage({ setImageData, imageData }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  async function handleFile(f) {
    if (!f) { setImageData(null); return }
    if (f.size > 3500000) return alert('Ukuran file terlalu besar (maks ~3.5MB)')
    const reader = new FileReader()
    reader.onload = () => setImageData(reader.result)
    reader.readAsDataURL(f)
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => {
        const f = e.target.files && e.target.files[0]
        handleFile(f)
      }} />

      <div
        onClick={() => inputRef.current && inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragEnter={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={e => { e.preventDefault(); setDragging(false) }}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files && e.dataTransfer.files[0]; handleFile(f) }}
        className={`mt-2 rounded border-2 ${dragging ? 'border-amber-400 bg-amber-50' : 'border-dashed border-slate-300 bg-white'} p-6 flex flex-col items-center justify-center text-center cursor-pointer`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5V18a2 2 0 002 2h14a2 2 0 002-2v-1.5M7 10l5-5m0 0l5 5m-5-5v12" />
        </svg>
        <div className="mt-3 text-slate-700 font-semibold">Browse Files</div>
        <div className="text-sm text-slate-400">Drag and drop files here, or click to browse</div>
      </div>

      {imageData && (
        <div className="mt-3 flex items-center gap-4">
          <img src={imageData} alt="preview" className="w-28 h-20 object-cover rounded-md border" />
          <div className="flex flex-col">
            <span className="text-sm text-slate-600">Preview foto</span>
            <button type="button" onClick={() => setImageData(null)} className="mt-2 text-sm text-rose-600 hover:underline">Hapus foto</button>
          </div>
        </div>
      )}
    </div>
  )
}
