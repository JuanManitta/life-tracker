import type { Status, TrackedItem } from '@/types'
import ItemCard from '@/components/ItemCard'

export default function ItemList({
  items,
  onEdit,
  onStatusChange,
}: {
  items: TrackedItem[]
  onEdit: (item: TrackedItem) => void
  onStatusChange: (id: string, status: Status) => void
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
