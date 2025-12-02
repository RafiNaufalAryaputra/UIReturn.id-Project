import React from 'react'

export default function Header({ view, setView, user, onLogout }) {
  return (
    <header className="bg-white/60 backdrop-blur-sm sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="logo-mark" aria-hidden>
            <img src="/logo.png" alt="UIReturn.id" className="w-10 h-10 object-cover rounded-md" />
          </div>
          <div>
            <div className="text-lg font-semibold">UIReturn.id</div>
            <div className="text-xs text-slate-500">Lost & Found — Universitas Indonesia</div>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <button onClick={() => setView('home')} className={`px-2 py-1 rounded ${view==='home' ? 'bg-accent-light text-accent-dark' : 'text-slate-700 hover:text-accent-dark'}`}>Home</button>
          <button onClick={() => setView('search')} className={`px-2 py-1 rounded ${view==='search' ? 'bg-accent-light text-accent-dark' : 'text-slate-700 hover:text-accent-dark'}`}>Cari</button>
          <button onClick={() => setView('report')} className={`px-2 py-1 rounded ${view==='report' ? 'bg-accent-light text-accent-dark' : 'text-slate-700 hover:text-accent-dark'}`}>Laporkan</button>
          <button onClick={() => setView('how')} className={`px-2 py-1 rounded ${view==='how' ? 'bg-accent-light text-accent-dark' : 'text-slate-700 hover:text-accent-dark'}`}>Cara Kerja</button>
          <button onClick={() => setView('about')} className={`px-2 py-1 rounded ${view==='about' ? 'bg-accent-light text-accent-dark' : 'text-slate-700 hover:text-accent-dark'}`}>About</button>
          <button onClick={() => setView('contact')} className={`px-2 py-1 rounded ${view==='contact' ? 'bg-accent-light text-accent-dark' : 'text-slate-700 hover:text-accent-dark'}`}>Hubungi</button>
          {user ? (
            <div className="flex items-center gap-3 ml-4">
              <div className="text-sm">Halo, <strong>{user.name || user.email}</strong></div>
              <button onClick={() => { onLogout && onLogout() }} className="px-3 py-1 rounded border">Logout</button>
            </div>
          ) : (
            <button onClick={() => setView('login')} className="ml-4 px-3 py-2 rounded bg-accent-dark text-white hover:bg-accent transition">Masuk</button>
          )}
        </nav>
      </div>
    </header>
  )
}
