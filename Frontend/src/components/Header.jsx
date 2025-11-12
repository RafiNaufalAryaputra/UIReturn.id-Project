import React from 'react'

export default function Header({ view, setView }) {
  return (
    <header className="bg-white/60 backdrop-blur-sm sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="logo-mark" aria-hidden>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="48" height="48" rx="10" fill="#F39C12" />
              <path d="M14 30V18h6l6 12v-12h6v12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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
          <button onClick={() => setView('contact')} className="ml-4 px-3 py-2 rounded bg-accent-dark text-white hover:bg-accent transition">Hubungi</button>
        </nav>
      </div>
    </header>
  )
}
