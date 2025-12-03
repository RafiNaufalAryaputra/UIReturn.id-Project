import { useState, useEffect } from 'react'

export default function Profile({ user, setUser }) {
  const [profile, setProfile] = useState(user || null)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [reports, setReports] = useState([])
  const API = import.meta.env.VITE_API || 'http://localhost:3000'

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API}/api/users/me`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
          setName(data.name || '')
        }
        const r2 = await fetch(`${API}/api/users/me/items`, { headers: { Authorization: token ? `Bearer ${token}` : '' } })
        if (r2.ok) setReports(await r2.json())
      } catch (err) {}
    }
    load()
  }, [user])

  async function saveName(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/users/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ name }) })
      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
        try { localStorage.setItem('user', JSON.stringify(updated)) } catch (e) {}
        if (setUser) setUser(updated)
        alert('Nama diperbarui')
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Gagal memperbarui')
      }
    } catch (err) { alert('Gagal memperbarui') }
    setLoading(false)
  }

  async function changePassword(e) {
    e.preventDefault()
    if (!currentPassword || !newPassword) return alert('Isi password sekarang dan password baru')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API}/api/users/me/password`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ currentPassword, newPassword }) })
      if (res.ok) {
        alert('Password berhasil diubah')
        setCurrentPassword('')
        setNewPassword('')
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Gagal mengubah password')
      }
    } catch (err) { alert('Gagal mengubah password') }
    setLoading(false)
  }

  async function uploadAvatar(e) {
    e.preventDefault()
    if (!avatarFile) return alert('Pilih file avatar')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const fd = new FormData()
      fd.append('file', avatarFile)
      const res = await fetch(`${API}/api/users/me/avatar`, { method: 'POST', headers: { Authorization: token ? `Bearer ${token}` : '' }, body: fd })
      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
        try { localStorage.setItem('user', JSON.stringify(updated)) } catch (e) {}
        if (setUser) setUser(updated)
        alert('Avatar berhasil diunggah')
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Gagal mengunggah avatar')
      }
    } catch (err) { alert('Gagal mengunggah avatar') }
    setLoading(false)
  }

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold mb-4">Profil Saya</h2>
      {!user ? (
        <div className="text-sm text-slate-600">Silakan login untuk melihat profil</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded shadow p-6">
            <div className="text-sm text-slate-600 mb-3">Akun</div>
            <div className="flex flex-col items-center">
              {profile && profile.avatar ? (
                <img src={`${API}${profile.avatar}`} alt="avatar" className="w-24 h-24 rounded-full object-cover mb-3" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center mb-3">{(profile && (profile.name || profile.email) ? (profile.name || profile.email).slice(0,1).toUpperCase() : 'U')}</div>
              )}
              <div className="text-sm font-medium">{profile && (profile.name || profile.email)}</div>
              <div className="text-xs text-slate-500">{profile && profile.email}</div>
            </div>

            <form onSubmit={uploadAvatar} className="mt-4 w-full">
              <label className="text-sm block mb-2 text-center">Unggah Foto Profil</label>
              <div className="flex flex-col items-center gap-2">
                <input type="file" onChange={e => setAvatarFile(e.target.files && e.target.files[0])} className="block w-full max-w-xs" />
                <button className="px-4 py-2 bg-accent-dark text-white rounded w-full max-w-xs" disabled={loading}>Unggah</button>
              </div>
            </form>
          </div>

          <div className="md:col-span-2 bg-white rounded shadow p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Edit Nama</h3>
              <form onSubmit={saveName} className="flex gap-2">
                <input value={name} onChange={e => setName(e.target.value)} className="flex-1 p-2 border rounded" />
                <button className="px-3 py-1 bg-accent-dark text-white rounded" disabled={loading}>Simpan</button>
              </form>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Ganti Password</h3>
              <form onSubmit={changePassword} className="space-y-2">
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Password sekarang" className="w-full p-2 border rounded" />
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password baru" className="w-full p-2 border rounded" />
                <button className="px-3 py-1 bg-accent-dark text-white rounded" disabled={loading}>Ubah Password</button>
              </form>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Laporan Saya</h3>
              <div className="space-y-2">
                {reports.length === 0 ? (
                  <div className="text-sm text-slate-500">Belum ada laporan</div>
                ) : (
                  reports.map(it => (
                    <div key={it.id} className="p-2 border rounded flex items-start justify-between">
                      <div>
                        <div className="font-medium">{it.title}</div>
                        <div className="text-xs text-slate-500">{it.location} • {new Date(it.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-xs text-slate-500">{it.claimStatus === 'none' ? 'Belum diklaim' : it.claimStatus}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
