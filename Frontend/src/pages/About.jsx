export default function About(){
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-2xl font-semibold">Tentang UIReturn.id</h2>
      <p className="mt-3 text-slate-600">UIReturn.id adalah platform lost & found internal untuk lingkungan Universitas Indonesia. Tujuannya mempermudah proses pelaporan, pencarian, dan klaim barang hilang dengan alur yang transparan dan terpusat.</p>
      <ul className="mt-4 list-disc list-inside text-slate-600">
        <li>Mendukung laporan barang hilang dan ditemukan</li>
        <li>Pencarian berbasis teks (judul, deskripsi, lokasi)</li>
        <li>Riwayat laporan tersimpan untuk referensi</li>
      </ul>
    </div>
  )
}
