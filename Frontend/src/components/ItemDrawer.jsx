import { useState } from 'react'
import ChatThread from './ChatThread'

export default function ItemDrawer({ item, onClose, onClaim, user, onResolveClaim }) {
  const [zoom, setZoom] = useState(false)
  if (!item) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <aside className="w-full max-w-md bg-white border-l shadow-lg p-6 overflow-auto">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <div className="text-xs text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</div>
          </div>
          <button onClick={onClose} className="text-slate-500">✕</button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <div className="text-xs text-slate-500">Found/Lost</div>
            <div className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${item.found ? 'bg-amber-100 text-amber-800' : 'bg-rose-50 text-rose-800'}`}>{item.found ? 'Found Item' : 'Lost Item'}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Location</div>
            <div className="mt-2">{item.location || '-'}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Further Details</div>
            <div className="mt-2 text-slate-700">{item.description}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Contact</div>
            <div className="mt-2">{item.contact || '-'}</div>
          </div>

          {item.reportedBy && (
            <div>
              <div className="text-xs text-slate-500">Pelapor</div>
              <div className="mt-2">
                <button onClick={() => { onOpenMessages && onOpenMessages(item.reportedBy); onClose && onClose() }} className="text-sm text-accent-dark hover:underline">{item.reporterName || item.reportedBy}</button>
              </div>
            </div>
          )}

          <div>
            <div className="text-xs text-slate-500">Image of Item</div>
            <div className="mt-2">
              {item.imageData ? (
                <img src={item.imageData} alt={item.title} className="w-40 h-40 object-cover rounded cursor-pointer" onClick={() => setZoom(true)} />
              ) : (
                <div className="w-40 h-40 bg-slate-100 rounded flex items-center justify-center text-slate-400">No image</div>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            {!item.claimed ? (
              item.claimStatus === 'pending' ? (
                user && user.isAdmin ? (
                  <>
                    <button onClick={() => onResolveClaim && onResolveClaim(item.id, 'approve')} className="px-4 py-2 bg-emerald-600 text-white rounded">Approve</button>
                    <button onClick={() => onResolveClaim && onResolveClaim(item.id, 'reject')} className="px-4 py-2 bg-rose-600 text-white rounded">Reject</button>
                  </>
                ) : (
                  <div className="text-sm text-amber-600">Klaim: Pending</div>
                )
              ) : (
                <button onClick={() => onClaim && onClaim(item)} className="px-4 py-2 bg-amber-500 text-white rounded">Klaim</button>
              )
            ) : (
              <div className="text-sm text-emerald-700">Diklaim oleh: {item.claimer || '—'}</div>
            )}
          </div>

          {/* Chat thread */}
          <ChatThread itemId={item.id} user={user} />
        </div>
      </aside>

      {zoom && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80" onClick={() => setZoom(false)}>
          <img src={item.imageData} alt={item.title} className="max-w-[90%] max-h-[90%] object-contain" />
        </div>
      )}
    </div>
  )
}
