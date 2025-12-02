import React, { useState } from 'react'
import API from '../api'

export default function Register({ onRegistered, onGotoLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    setErr('')
    try {
      const res = await API.post('/api/users/register', { name, email, password })
      if (res?.status === 201) {
        onRegistered && onRegistered()
      }
    } catch (error) {
      setErr(error?.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">Register</h3>
      <form onSubmit={submit} className="space-y-3 bg-white p-4 rounded shadow">
        <div>
          <label className="text-sm">Nama</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="text-sm">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="text-sm">Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-accent-dark text-white rounded">Register</button>
          <button type="button" onClick={onGotoLogin} className="px-4 py-2 border rounded">Login</button>
        </div>
      </form>
    </div>
  )
}
