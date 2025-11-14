export default function ItemCard({ item, onClaimClick }) {
  return (
    <div className="flex flex-col sm:flex-row items-start justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1">
      <div className="flex gap-4 w-full">
        <div className="w-24 h-24 rounded-lg bg-accent-light flex items-center justify-center text-accent-dark font-semibold text-2xl flex-shrink-0 overflow-hidden shadow-sm">
          {item.imageData ? (
            <img src={item.imageData} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{item.title?.charAt(0) || '?'}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${item.found ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{item.found ? 'Ditemukan' : 'Hilang'}</span>
            {item.claimed && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Sudah Diklaim</span>}
          </div>

          <p className="text-sm text-slate-600 mt-2 line-clamp-3">{item.description}</p>

          <div className="mt-3 text-sm text-slate-600 space-y-1">
            <div><strong>Lokasi:</strong> {item.location}</div>
            <div><strong>Kontak:</strong> {item.contact || '-'}</div>
            <div className="text-xs text-slate-400 mt-1">Dilaporkan: {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</div>
            {item.claimed && <div className="text-emerald-700 font-medium mt-2">Diklaim oleh: {item.claimer || '—'}</div>}
          </div>
        </div>
      </div>

      <div className="w-full sm:w-auto flex-shrink-0 flex flex-col gap-2 items-end mt-4 sm:mt-0">
        {!item.claimed ? (
          <button
            className="px-4 py-2 bg-accent-dark text-white rounded-lg shadow-md hover:brightness-95 transition"
            onClick={() => onClaimClick && onClaimClick(item)}
          >
            Klaim
          </button>
        ) : (
          <button className="px-3 py-1 border rounded bg-white text-slate-500" disabled>Telah Diklaim</button>
        )}

        <div className="text-xs text-slate-400">ID: {item.id}</div>
      </div>
    </div>
  )
}

