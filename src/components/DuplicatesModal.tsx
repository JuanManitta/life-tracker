import { useMemo, useState } from 'react'
import { Trash2, X } from 'lucide-react'
import type { TrackedItem } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { normalizeText } from '@/lib/normalize'

function formatDate(epochMs?: number) {
  if (!epochMs) return null
  return new Date(epochMs).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export interface DuplicateGroup {
  key: string
  items: TrackedItem[]
}

export function findDuplicateGroups(items: TrackedItem[]): DuplicateGroup[] {
  const groups = new Map<string, TrackedItem[]>()
  for (const item of items) {
    const key = `${item.category}::${normalizeText(item.title)}`
    const group = groups.get(key)
    if (group) group.push(item)
    else groups.set(key, [item])
  }
  return Array.from(groups.entries())
    .filter(([, groupItems]) => groupItems.length > 1)
    .map(([key, groupItems]) => ({ key, items: groupItems }))
}

export default function DuplicatesModal({
  items,
  onClose,
  onDelete,
}: {
  items: TrackedItem[]
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const groups = useMemo(() => findDuplicateGroups(items), [items])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full sm:max-w-lg bg-navy-850 border border-navy-700 rounded-2xl p-5 max-h-[90vh] overflow-y-auto safe-bottom">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-50">Duplicados</h2>
            <p className="text-xs text-slate-400">
              {groups.length === 0
                ? 'No se encontraron duplicados'
                : `${groups.length} título${groups.length === 1 ? '' : 's'} repetido${groups.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X size={22} />
          </button>
        </div>

        {groups.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">
            Todo en orden, no hay títulos repetidos.
          </p>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => (
              <div
                key={group.key}
                className="rounded-xl border border-navy-700 overflow-hidden"
              >
                <div className="bg-navy-800 px-3 py-1.5 text-xs font-medium text-slate-400">
                  {group.items[0].title} · {CATEGORY_LABELS[group.items[0].category]}
                </div>
                <div className="divide-y divide-navy-700">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {[
                            item.status === 'done' ? 'Terminado' : item.status,
                            item.rating ? `★ ${item.rating}` : null,
                            formatDate(item.completedAt ?? item.updatedAt),
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={deletingId === item.id}
                        onClick={async () => {
                          setDeletingId(item.id)
                          try {
                            await onDelete(item.id)
                          } finally {
                            setDeletingId(null)
                          }
                        }}
                        className="shrink-0 flex items-center gap-1 rounded-md border border-red-900/60 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-950/40 disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        {deletingId === item.id ? 'Borrando…' : 'Eliminar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
