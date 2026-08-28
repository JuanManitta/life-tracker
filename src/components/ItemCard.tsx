import { BookOpen, Gamepad2, Clapperboard, Tv, BookMarked, type LucideIcon } from 'lucide-react'
import type { Category, Status, TrackedItem } from '@/types'
import { CATEGORY_CREATOR_FIELD, STATUS_LABELS } from '@/types'

const ICONS: Record<Category, LucideIcon> = {
  books: BookOpen,
  games: Gamepad2,
  movies: Clapperboard,
  series: Tv,
  comics: BookMarked,
}

const STATUS_STYLES: Record<Status, string> = {
  backlog: 'bg-navy-700 text-slate-300',
  ongoing: 'bg-amber-500/15 text-amber-400',
  done: 'bg-emerald-500/15 text-emerald-400',
}

function formatDate(ts: number) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts))
}

export default function ItemCard({
  item,
  compact = false,
  onEdit,
  onStatusChange,
}: {
  item: TrackedItem
  compact?: boolean
  onEdit: (item: TrackedItem) => void
  onStatusChange: (id: string, status: Status) => void
}) {
  const Icon = ICONS[item.category]
  const creatorField = CATEGORY_CREATOR_FIELD[item.category]
  const creatorValue = (item as unknown as Record<string, string | undefined>)[
    creatorField
  ]

  if (compact) {
    return (
      <div className="bg-navy-850 border border-navy-700/60 rounded-xl p-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="flex flex-col gap-2 text-left min-w-0"
        >
          <div className="h-9 w-9 shrink-0 rounded-lg bg-navy-700 flex items-center justify-center text-accent-light">
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-100 truncate text-sm">
              {item.title}
            </p>
            {creatorValue && (
              <p className="text-xs text-slate-400 truncate">{creatorValue}</p>
            )}
          </div>
        </button>

        <div className="flex items-center justify-between gap-1">
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full truncate ${STATUS_STYLES[item.status]}`}
          >
            {STATUS_LABELS[item.status]}
          </span>
          <select
            value={item.status}
            onChange={(e) => onStatusChange(item.id, e.target.value as Status)}
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] bg-navy-800 border border-navy-600 rounded-md px-1 py-0.5 text-slate-300 min-w-0"
          >
            <option value="backlog">Pendiente</option>
            <option value="ongoing">En curso</option>
            <option value="done">Terminado</option>
          </select>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-navy-850 border border-navy-700/60 rounded-xl p-3.5 flex items-start gap-3">
      <button
        type="button"
        onClick={() => onEdit(item)}
        className="flex-1 flex gap-3 text-left min-w-0"
      >
        <div className="h-10 w-10 shrink-0 rounded-lg bg-navy-700 flex items-center justify-center text-accent-light">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-100 truncate">{item.title}</p>
          {creatorValue && (
            <p className="text-sm text-slate-400 truncate">{creatorValue}</p>
          )}
          <p className="text-[11px] text-slate-500 mt-0.5">
            Actualizado {formatDate(item.updatedAt)}
          </p>
        </div>
      </button>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status]}`}
        >
          {STATUS_LABELS[item.status]}
        </span>
        <select
          value={item.status}
          onChange={(e) => onStatusChange(item.id, e.target.value as Status)}
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] bg-navy-800 border border-navy-600 rounded-md px-1.5 py-1 text-slate-300"
        >
          <option value="backlog">Pendiente</option>
          <option value="ongoing">En curso</option>
          <option value="done">Terminado</option>
        </select>
      </div>
    </div>
  )
}
