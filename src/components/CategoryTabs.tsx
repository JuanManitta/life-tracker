import { BookOpen, Gamepad2, Clapperboard, Tv, BookMarked, LayoutGrid, type LucideIcon } from 'lucide-react'
import type { Category } from '@/types'
import { CATEGORY_LABELS } from '@/types'

type CategoryFilter = 'all' | Category

const ICONS: Record<CategoryFilter, LucideIcon> = {
  all: LayoutGrid,
  books: BookOpen,
  games: Gamepad2,
  movies: Clapperboard,
  series: Tv,
  comics: BookMarked,
}

const ORDER: CategoryFilter[] = ['all', 'books', 'games', 'movies', 'series', 'comics']

export default function CategoryTabs({
  value,
  onChange,
}: {
  value: CategoryFilter
  onChange: (v: CategoryFilter) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
      {ORDER.map((cat) => {
        const Icon = ICONS[cat]
        const label = cat === 'all' ? 'Todos' : CATEGORY_LABELS[cat]
        const active = value === cat
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-accent text-white'
                : 'bg-navy-800 text-slate-300 hover:bg-navy-700'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
