import { Inbox } from 'lucide-react'

export default function EmptyState({
  categoryLabel,
}: {
  categoryFilter: string
  categoryLabel?: string
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
      <div className="h-14 w-14 rounded-full bg-navy-800 flex items-center justify-center text-slate-500 mb-4">
        <Inbox size={26} />
      </div>
      <p className="text-slate-300 font-medium">
        {categoryLabel
          ? `Todavía no agregaste nada en ${categoryLabel}`
          : 'Todavía no agregaste nada'}
      </p>
      <p className="text-sm text-slate-500 mt-1">
        Tocá el botón + para sumar tu primer ítem
      </p>
    </div>
  )
}
