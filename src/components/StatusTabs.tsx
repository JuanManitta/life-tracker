import type { Status } from '@/types'
import { STATUS_LABELS } from '@/types'

type StatusFilter = 'all' | Status

const ORDER: StatusFilter[] = ['all', 'backlog', 'ongoing', 'done']

export default function StatusTabs({
  value,
  onChange,
  counts,
}: {
  value: StatusFilter
  onChange: (v: StatusFilter) => void
  counts: Record<StatusFilter, number>
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 pb-0.5 scrollbar-none">
      {ORDER.map((s) => {
        const label = s === 'all' ? 'Todo' : STATUS_LABELS[s]
        const active = value === s
        const count = counts[s] ?? 0
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
              active
                ? 'border-accent text-accent-light bg-accent/10'
                : 'border-navy-700 text-slate-400'
            }`}
          >
            {label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${
                active ? 'bg-accent/20' : 'bg-navy-700'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
