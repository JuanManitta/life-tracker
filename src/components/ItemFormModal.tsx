import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import type { Category, Status, TrackedItem } from '@/types'
import {
  CATEGORY_CREATOR_FIELD,
  CATEGORY_CREATOR_LABEL,
  CATEGORY_LABELS,
} from '@/types'

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
}

export default function ItemFormModal({
  initialItem,
  defaultCategory,
  onClose,
  onSave,
  onDelete,
}: {
  initialItem: TrackedItem | null
  defaultCategory: Category
  onClose: () => void
  onSave: (item: TrackedItem) => Promise<void> | void
  onDelete?: () => Promise<void> | void
}) {
  const [category, setCategory] = useState<Category>(
    initialItem?.category ?? defaultCategory
  )
  const [title, setTitle] = useState(initialItem?.title ?? '')
  const [status, setStatus] = useState<Status>(initialItem?.status ?? 'backlog')
  const [creator, setCreator] = useState(
    initialItem
      ? ((initialItem as unknown as Record<string, string | undefined>)[
          CATEGORY_CREATOR_FIELD[initialItem.category]
        ] ?? '')
      : ''
  )
  const [notes, setNotes] = useState(initialItem?.notes ?? '')
  const [saving, setSaving] = useState(false)

  const creatorLabel = CATEGORY_CREATOR_LABEL[category]
  const creatorField = CATEGORY_CREATOR_FIELD[category]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const now = Date.now()
    const item = {
      id: initialItem?.id ?? generateId(),
      category,
      title: title.trim(),
      status,
      notes: notes.trim() || undefined,
      [creatorField]: creator.trim() || undefined,
      createdAt: initialItem?.createdAt ?? now,
      updatedAt: now,
    } as TrackedItem
    await onSave(item)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <button
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full sm:max-w-md bg-navy-850 border border-navy-700 rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto safe-bottom"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-50">
            {initialItem ? 'Editar' : 'Agregar'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Categoría
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-xs py-2 px-1 rounded-lg border font-medium truncate ${
                    category === cat
                      ? 'border-accent bg-accent/10 text-accent-light'
                      : 'border-navy-700 text-slate-400'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Título
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              placeholder="Nombre..."
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {creatorLabel}
            </label>
            <input
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              placeholder={`${creatorLabel}...`}
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Estado
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  ['backlog', 'Pendiente'],
                  ['ongoing', 'En curso'],
                  ['done', 'Terminado'],
                ] as [Status, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={`text-xs py-2 rounded-lg border font-medium ${
                    status === value
                      ? 'border-accent bg-accent/10 text-accent-light'
                      : 'border-navy-700 text-slate-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Comentarios, progreso, etc."
              className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-accent resize-none"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-red-500/40 text-red-400 text-sm font-medium"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          )}
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="flex-1 bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
