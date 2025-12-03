import React from 'react'

function Badge({ found }) {
  return (
    <span className={`inline-block text-xs px-3 py-1 rounded-full ${found ? 'bg-amber-100 text-amber-800' : 'bg-rose-50 text-rose-800'}`}>
      {found ? 'Found Item' : 'Lost Item'}
    </span>
  )
}

export default function ItemsTable({ items, onClaimClick, onRowClick, user, onResolveClaim }) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <table className="w-full text-sm table-auto">
        <thead>
          <tr className="bg-slate-50 text-slate-700">
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">Found/Lost</th>
            <th className="px-3 py-2 text-left">Location</th>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Further Details</th>
            <th className="px-3 py-2 text-left">Contact</th>
            <th className="px-3 py-2 text-left">Image</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={it.id} className="border-t hover:bg-slate-50 align-top cursor-pointer" onClick={() => onRowClick && onRowClick(it)}>
              <td className="px-3 py-2 align-top">{idx + 1}</td>
              <td className="px-3 py-2 align-top"><Badge found={!!it.found} /></td>
              <td className="px-3 py-2 align-top">{it.location || '-'}</td>
              <td className="px-3 py-2 align-top">{it.createdAt ? new Date(it.createdAt).toLocaleDateString() : '-'}</td>
              <td className="px-3 py-2 align-top max-w-none whitespace-normal"> 
                <div className="font-semibold text-slate-800">{it.title}</div>
                <div className="text-slate-500">{it.description}</div>
              </td>
              <td className="px-3 py-2 align-top">{it.contact || '-'}</td>
              <td className="px-3 py-2 align-top">
                {it.imageData ? <img src={it.imageData} alt={it.title} className="w-9 h-9 object-cover rounded" /> : <div className="w-9 h-9 bg-slate-100 rounded flex items-center justify-center text-slate-400">—</div>}
              </td>
              <td className="px-3 py-2 align-top text-right">
                {it.claimStatus === 'pending' ? (
                  user && user.isAdmin ? (
                    <div className="flex gap-2 justify-end">
                      <button onClick={(e) => { e.stopPropagation(); onResolveClaim && onResolveClaim(it.id, 'approve') }} className="px-2 py-1 bg-emerald-600 text-white rounded text-sm">Approve</button>
                      <button onClick={(e) => { e.stopPropagation(); onResolveClaim && onResolveClaim(it.id, 'reject') }} className="px-2 py-1 bg-rose-600 text-white rounded text-sm">Reject</button>
                    </div>
                  ) : (
                    <span className="text-sm text-amber-600">Pending</span>
                  )
                ) : (
                  !it.claimed ? (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={(e) => { e.stopPropagation(); onClaimClick && onClaimClick(it) }} className="px-3 py-1 bg-amber-500 text-white rounded text-sm">Klaim</button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        if (it.reportedBy) {
                          const initial = `Halo, saya tertarik dengan laporan Anda: "${it.title}" (ID ${it.id}). Apakah barang masih tersedia?`;
                          window.dispatchEvent(new CustomEvent('openChat', { detail: { otherId: it.reportedBy, initialMessage: initial } }));
                        } else {
                          alert('Pelapor tidak tersedia')
                        }
                      }} className="px-2 py-1 border rounded bg-white text-slate-700 text-sm">Chat</button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Telah Diklaim</span>
                  )
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
