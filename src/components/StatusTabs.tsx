import type { Status } from '@/types'
import { STATUS_LABELS } from '@/types'

type StatusFilter = 'all' | Status

const ORDER: StatusFilter[] = ['all', 'backlog', 'ongoing', 'done']

export default function StatusTabs({
  value,
  onChange,
}: {
  value: StatusFilter
  onChange: (v: StatusFilter) => void
}) {
  return (
    <div className="mt-2 flex gap-1.5 overflow-x-auto scrollbar-none">
      {ORDER.map((s) => {
        const label = s === 'all' ? 'Todo' : STATUS_LABELS[s]
        const active = value === s
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium border transition-colors ${
              active
                ? 'border-accent text-accent-light bg-accent/10'
                : 'border-navy-700 text-slate-400'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
