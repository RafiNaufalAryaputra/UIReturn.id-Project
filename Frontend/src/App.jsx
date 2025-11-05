import './App.css'

function App() {
  return (
    <div className="site">
      <header className="site-header">
        <div className="container header-inner">
          <div className="brand">UIReturn.id</div>
          <nav className="nav">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <button className="btn btn-ghost">Login SSO</button>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-inner">
            <span className="badge">Smart Campus Initiative</span>
            <h1 className="hero-title">Sistem Pencarian Barang Hilang UI</h1>
            <p className="hero-sub">Platform terpusat untuk melaporkan dan mencari barang hilang di kampus Universitas Indonesia</p>

            <div className="hero-cta">
              <button className="btn btn-primary">Laporkan Barang Hilang</button>
              <button className="btn btn-light">Cari Barang</button>
            </div>
          </div>
        </section>

        <section id="features" className="features">
          <div className="container">
            <h2>Fitur Utama</h2>
            <p className="muted">Sistem yang memudahkan proses lost &amp; found di kampus</p>

            <div className="features-grid">
              <div className="card feature-card">
                <h3>Laporkan Cepat</h3>
                <p>Form sederhana untuk mencatat detail barang hilang atau ditemukan.</p>
              </div>
              <div className="card feature-card">
                <h3>Pencarian Terpusat</h3>
                <p>Database yang mudah dicari untuk memperbesar kemungkinan menemukan barang.</p>
              </div>
              <div className="card feature-card">
                <h3>Notifikasi & Keamanan</h3>
                <p>Pemberitahuan untuk pemilik dan admin, serta alur verifikasi yang aman.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} UIReturn.id — Lost & Found System</p>
        </div>
      </footer>
    </div>
  )
}

export default App
