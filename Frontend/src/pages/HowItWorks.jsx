export default function HowItWorks(){
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="text-2xl font-semibold">Cara Kerja</h2>
      <ol className="mt-3 list-decimal list-inside text-slate-600 space-y-2">
        <li>Pengguna melaporkan barang hilang atau ditemukan melalui form.</li>
        <li>Data tersimpan di sistem (local storage atau backend API jika diaktifkan).</li>
        <li>Pencari dapat menelusuri data berdasarkan kata kunci.</li>
        <li>Jika menemukan barang, pengguna bisa mengklaim dengan menyediakan identitas/nomor kontak.</li>
        <li>Admin atau pemilik dapat memverifikasi klaim dan menutup kasus.</li>
      </ol>
    </div>
  )
}
