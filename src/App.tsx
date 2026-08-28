import { Suspense, lazy, useMemo, useState } from 'react'
import { Plus, LayoutList, BarChart3, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useItems } from '@/hooks/useItems'
import type { Category, Status, TrackedItem } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import CategoryTabs from '@/components/CategoryTabs'
import StatusTabs from '@/components/StatusTabs'
import ItemList from '@/components/ItemList'
import ItemFormModal from '@/components/ItemFormModal'
import EmptyState from '@/components/EmptyState'
import LoginScreen from '@/components/LoginScreen'
import { seedItems } from '@/seedData'

const StatsView = lazy(() => import('@/components/StatsView'))

type CategoryFilter = 'all' | Category
type StatusFilter = 'all' | Status
type View = 'home' | 'stats'

export default function App() {
  const {
    user,
    loading: authLoading,
    signingIn,
    error: authError,
    signIn,
    signOut,
    isFirebaseConfigured,
  } = useAuth()

  if (isFirebaseConfigured && authLoading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center text-slate-500 text-sm">
        Cargando…
      </div>
    )
  }

  if (isFirebaseConfigured && !user) {
    return (
      <LoginScreen onSignIn={signIn} signingIn={signingIn} error={authError} />
    )
  }

  return (
    <MainApp
      userId={user?.uid ?? null}
      userName={user?.displayName ?? null}
      userPhoto={user?.photoURL ?? null}
      onSignOut={isFirebaseConfigured ? signOut : undefined}
    />
  )
}

function MainApp({
  userId,
  userName,
  userPhoto,
  onSignOut,
}: {
  userId: string | null
  userName: string | null
  userPhoto: string | null
  onSignOut?: () => void
}) {
  const { items, loading, usingCloud, upsertItem, updateStatus, deleteItem } =
    useItems(userId)
  const [view, setView] = useState<View>('home')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TrackedItem | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter
      return matchesCategory && matchesStatus
    })
  }, [items, categoryFilter, statusFilter])

  const categoryCounts = useMemo(() => {
    const counts: Record<'all' | Category, number> = {
      all: items.length,
      books: 0,
      games: 0,
      movies: 0,
      series: 0,
      comics: 0,
    }
    for (const item of items) {
      counts[item.category] += 1
    }
    return counts
  }, [items])

  const statusCounts = useMemo(() => {
    const itemsInCategory =
      categoryFilter === 'all'
        ? items
        : items.filter((item) => item.category === categoryFilter)
    const counts: Record<'all' | Status, number> = {
      all: itemsInCategory.length,
      backlog: 0,
      ongoing: 0,
      done: 0,
    }
    for (const item of itemsInCategory) {
      counts[item.status] += 1
    }
    return counts
  }, [items, categoryFilter])

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
      <header className="safe-top sticky top-0 z-20 bg-navy-900/90 backdrop-blur border-b border-navy-800 px-4 pb-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-50">
              Ocio Tracker
            </h1>
            <p className="text-xs text-slate-400">
              {usingCloud ? 'Sincronizado en la nube' : 'Guardado en este dispositivo'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex gap-1 bg-navy-800 rounded-full p-1">
              <button
                type="button"
                onClick={() => setView('home')}
                aria-label="Inicio"
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                  view === 'home' ? 'bg-accent text-white' : 'text-slate-400'
                }`}
              >
                <LayoutList size={16} />
              </button>
              <button
                type="button"
                onClick={() => setView('stats')}
                aria-label="Estadísticas"
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                  view === 'stats' ? 'bg-accent text-white' : 'text-slate-400'
                }`}
              >
                <BarChart3 size={16} />
              </button>
            </div>

            {onSignOut && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Cuenta"
                  className="h-8 w-8 rounded-full overflow-hidden bg-navy-700 border border-navy-600 flex items-center justify-center text-xs font-semibold text-slate-200"
                >
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={userName ?? 'Usuario'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (userName?.[0] ?? '?').toUpperCase()
                  )}
                </button>

                {menuOpen && (
                  <>
                    <button
                      aria-label="Cerrar menú"
                      className="fixed inset-0 z-20"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-10 z-30 w-44 bg-navy-800 border border-navy-700 rounded-xl shadow-lg py-1.5">
                      {userName && (
                        <p className="px-3 py-1.5 text-xs text-slate-400 truncate border-b border-navy-700 mb-1">
                          {userName}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false)
                          onSignOut()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-navy-700"
                      >
                        <LogOut size={15} />
                        Cerrar sesión
                      </button>
                      {import.meta.env.DEV && (
                        <button
                          type="button"
                          onClick={async () => {
                            setMenuOpen(false)
                            for (const it of seedItems) {
                              await upsertItem(it)
                            }
                            alert(`Importados ${seedItems.length} items`)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-navy-700 border-t border-navy-700 mt-1"
                        >
                          Importar seed (una vez)
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {view === 'home' && (
          <div className="flex flex-col gap-2">
            <CategoryTabs value={categoryFilter} onChange={setCategoryFilter} counts={categoryCounts} />
            <StatusTabs value={statusFilter} onChange={setStatusFilter} counts={statusCounts} />
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
          defaultCategory={categoryFilter === 'all' ? 'books' : categoryFilter}
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
