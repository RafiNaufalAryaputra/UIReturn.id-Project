import React, { useState } from 'react'

export default function Header({ view, setView, user, onLogout }) {
  const [open, setOpen] = useState(false)

  function navButton(label, v) {
    return (
      <button onClick={() => { setView(v); setOpen(false) }} className={`block w-full text-left px-3 py-2 rounded ${view===v ? 'bg-accent-light text-accent-dark' : 'text-slate-700 hover:text-accent-dark'}`}>{label}</button>
    )
  }

  return (
    <header className="bg-white/60 backdrop-blur-sm sticky top-0 z-30 shadow-sm">
      <div className="max-w-screen-lg mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="logo-mark" aria-hidden>
            <img src="/logo.png" alt="UIReturn.id" className="w-10 h-10 object-cover rounded-md" />
          </div>
          <div className="hidden sm:block">
            <div className="text-lg font-semibold">UIReturn.id</div>
            <div className="text-xs text-slate-500">Lost & Found — Universitas Indonesia</div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4">
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

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          {user ? (
            <div className="text-sm mr-2 hidden sm:block">{user.name || user.email}</div>
          ) : null}
          <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label="Toggle menu" className="p-2 rounded-md hover:bg-slate-100">
            <svg className="w-6 h-6 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="absolute right-4 top-full mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 md:hidden">
            <div className="p-2">
              {navButton('Home','home')}
              {navButton('Cari','search')}
              {navButton('Laporkan','report')}
              {navButton('Cara Kerja','how')}
              {navButton('About','about')}
              {navButton('Hubungi','contact')}
              <div className="border-t my-2" />
              {user ? (
                <div>
                  <div className="px-3 py-2 text-sm">Halo, <strong>{user.name || user.email}</strong></div>
                  <button onClick={() => { onLogout && onLogout(); setOpen(false) }} className="w-full text-left px-3 py-2 rounded border">Logout</button>
                </div>
              ) : (
                <button onClick={() => { setView('login'); setOpen(false) }} className="w-full text-left px-3 py-2 rounded bg-accent-dark text-white">Masuk</button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
