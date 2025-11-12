import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white mt-12">
      <div className="container mx-auto px-6 py-6 text-center text-slate-600">© {new Date().getFullYear()} UIReturn.id — Lost & Found System</div>
    </footer>
  )
}
