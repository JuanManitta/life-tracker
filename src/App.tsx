import { Suspense, lazy, useMemo, useState } from 'react'
import { Plus, LayoutList, BarChart3 } from 'lucide-react'
import { useItems } from '@/hooks/useItems'
import type { Category, Status, TrackedItem } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import CategoryTabs from '@/components/CategoryTabs'
import StatusTabs from '@/components/StatusTabs'
import ItemList from '@/components/ItemList'
import ItemFormModal from '@/components/ItemFormModal'
import EmptyState from '@/components/EmptyState'

const StatsView = lazy(() => import('@/components/StatsView'))

type CategoryFilter = 'all' | Category
type StatusFilter = 'all' | Status
type View = 'home' | 'stats'

export default function App() {
  const { items, loading, usingCloud, upsertItem, updateStatus, deleteItem } =
    useItems()
  const [view, setView] = useState<View>('home')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TrackedItem | null>(null)

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter
      return matchesCategory && matchesStatus
    })
  }, [items, categoryFilter, statusFilter])

  function openAddModal() {
    setEditingItem(null)
    setModalOpen(true)
  }

  function openEditModal(item: TrackedItem) {
    setEditingItem(item)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col">
      <header className="safe-top sticky top-0 z-20 bg-navy-900/90 backdrop-blur border-b border-navy-800 px-4 pt-4 pb-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-50">
              Ocio Tracker
            </h1>
            <p className="text-xs text-slate-400">
              {usingCloud ? 'Sincronizado en la nube' : 'Guardado en este dispositivo'}
            </p>
          </div>
          <div className="flex gap-1 bg-navy-800 rounded-full p-1 shrink-0">
            <button
              type="button"
              onClick={() => setView('home')}
              aria-label="Inicio"
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                view === 'home'
                  ? 'bg-accent text-white'
                  : 'text-slate-400'
              }`}
            >
              <LayoutList size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView('stats')}
              aria-label="Estadísticas"
              className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                view === 'stats'
                  ? 'bg-accent text-white'
                  : 'text-slate-400'
              }`}
            >
              <BarChart3 size={16} />
            </button>
          </div>
        </div>
        {view === 'home' && (
          <div className="flex flex-col gap-2">
            <CategoryTabs value={categoryFilter} onChange={setCategoryFilter} />
            <StatusTabs value={statusFilter} onChange={setStatusFilter} />
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col px-4 pt-4 pb-28">
        {loading ? (
          <div className="flex-1 flex justify-center items-start pt-16 text-slate-500 text-sm">
            Cargando…
          </div>
        ) : view === 'stats' ? (
          <Suspense
            fallback={
              <div className="flex-1 flex justify-center items-start pt-16 text-slate-500 text-sm">
                Cargando estadísticas…
              </div>
            }
          >
            <StatsView items={items} />
          </Suspense>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            categoryFilter={categoryFilter}
            categoryLabel={
              categoryFilter === 'all'
                ? undefined
                : CATEGORY_LABELS[categoryFilter]
            }
          />
        ) : (
          <ItemList
            items={filteredItems}
            onEdit={openEditModal}
            onStatusChange={updateStatus}
          />
        )}
      </main>

      {view === 'home' && (
        <button
          type="button"
          onClick={openAddModal}
          aria-label="Agregar"
          className="fixed bottom-6 right-5 z-30 h-14 w-14 rounded-full bg-accent text-white flex items-center justify-center shadow-fab active:scale-95 transition-transform safe-bottom"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      {modalOpen && (
        <ItemFormModal
          initialItem={editingItem}
          defaultCategory={
            categoryFilter === 'all' ? 'books' : categoryFilter
          }
          onClose={() => setModalOpen(false)}
          onSave={async (item) => {
            await upsertItem(item)
            setModalOpen(false)
          }}
          onDelete={
            editingItem
              ? async () => {
                  await deleteItem(editingItem.id)
                  setModalOpen(false)
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
