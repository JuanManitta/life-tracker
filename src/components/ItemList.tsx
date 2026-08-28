import type { Status, TrackedItem } from '@/types'
import ItemCard from '@/components/ItemCard'

export default function ItemList({
  items,
  columns = 1,
  onEdit,
  onStatusChange,
}: {
  items: TrackedItem[]
  columns?: 1 | 2
  onEdit: (item: TrackedItem) => void
  onStatusChange: (id: string, status: Status) => void
}) {
  return (
    <div
      className={
        columns === 2
          ? 'grid grid-cols-2 gap-2.5 items-start'
          : 'flex flex-col gap-2.5'
      }
    >
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          compact={columns === 2}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
