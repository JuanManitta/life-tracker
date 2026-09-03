import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { Plus, LayoutList, BarChart3, LogOut, Rows3, Grid2x2, RefreshCw, Search, X, Copy } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useItems } from '@/hooks/useItems'
import type { Category, Status, TrackedItem } from '@/types'
import { CATEGORY_LABELS } from '@/types'
import { isEnrichmentConfigured, syncMissingCreators } from '@/lib/enrichment'
import { normalizeText } from '@/lib/normalize'
import CategoryTabs from '@/components/CategoryTabs'
import StatusTabs from '@/components/StatusTabs'
import {
  DateFilter,
  monthKeyOf,
  monthOnlyOf,
  yearOf,
  type MonthOnlyKey,
  type YearKey,
} from '@/components/MonthFilter'
import ItemList from '@/components/ItemList'
import ItemFormModal from '@/components/ItemFormModal'
import DuplicatesModal, { findDuplicateGroups } from '@/components/DuplicatesModal'
import EmptyState from '@/components/EmptyState'
import LoginScreen from '@/components/LoginScreen'

const StatsView = lazy(() => import('@/components/StatsView'))

type CategoryFilter = 'all' | Category
type StatusFilter = 'all' | Status
type View = 'home' | 'stats'
type Columns = 1 | 2

const COLUMNS_KEY = 'life-tracker-columns'

function getInitialColumns(): Columns {
  if (typeof window === 'undefined') return 1
  const stored = window.localStorage.getItem(COLUMNS_KEY)
  return stored === '2' ? 2 : 1
}

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
  const [yearFilter, setYearFilter] = useState<'all' | YearKey>('all')
  const [monthFilter, setMonthFilter] = useState<'all' | MonthOnlyKey>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TrackedItem | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [duplicatesOpen, setDuplicatesOpen] = useState(false)
  const [columns, setColumns] = useState<Columns>(getInitialColumns)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  useEffect(() => {
    window.localStorage.setItem(COLUMNS_KEY, String(columns))
  }, [columns])

  useEffect(() => {
    if (!syncMessage) return
    const timeout = setTimeout(() => setSyncMessage(null), 4000)
    return () => clearTimeout(timeout)
  }, [syncMessage])

  useEffect(() => {
    if (statusFilter !== 'done') {
      setYearFilter('all')
      setMonthFilter('all')
    }
  }, [statusFilter])

  const filteredItems = useMemo(() => {
    const query = normalizeText(searchQuery.trim())
    return items.filter((item) => {
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter
      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter
      const matchesYear =
        statusFilter !== 'done' ||
        yearFilter === 'all' ||
        (item.status === 'done' &&
          yearOf(monthKeyOf(item.completedAt ?? item.updatedAt)) === yearFilter)
      const matchesMonth =
        statusFilter !== 'done' ||
        monthFilter === 'all' ||
        (item.status === 'done' &&
          monthOnlyOf(monthKeyOf(item.completedAt ?? item.updatedAt)) === monthFilter)
      const matchesSearch = query === '' || normalizeText(item.title).includes(query)
      return matchesCategory && matchesStatus && matchesYear && matchesMonth && matchesSearch
    })
  }, [items, categoryFilter, statusFilter, yearFilter, monthFilter, searchQuery])

  const doneYears = useMemo(() => {
    const keys = new Set<YearKey>()
    for (const item of items) {
      if (item.status !== 'done') continue
      keys.add(yearOf(monthKeyOf(item.completedAt ?? item.updatedAt)))
    }
    return Array.from(keys).sort((a, b) => (a < b ? 1 : -1))
  }, [items])

  const doneMonths = useMemo(() => {
    const keys = new Set<MonthOnlyKey>()
    for (const item of items) {
      if (item.status !== 'done') continue
      const key = monthKeyOf(item.completedAt ?? item.updatedAt)
      if (yearFilter !== 'all' && yearOf(key) !== yearFilter) continue
      keys.add(monthOnlyOf(key))
    }
    return Array.from(keys).sort((a, b) => (a < b ? 1 : -1))
  }, [items, yearFilter])

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

  const duplicateCount = useMemo(() => findDuplicateGroups(items).length, [items])

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
              Life Tracker
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
                      {isEnrichmentConfigured() && (
                        <button
                          type="button"
                          disabled={syncing}
                          onClick={async () => {
                            setSyncing(true)
                            setSyncMessage(null)
                            try {
                              const result = await syncMissingCreators(items, upsertItem)
                              setSyncMessage(
                                result.updated === 0
                                  ? 'No había nada para completar'
                                  : `Completados ${result.updated} ítem${result.updated === 1 ? '' : 's'}`
                              )
                            } finally {
                              setSyncing(false)
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-navy-700 disabled:opacity-50"
                        >
                          <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
                          {syncing ? 'Buscando…' : 'Sync authors'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false)
                          setDuplicatesOpen(true)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-navy-700"
                      >
                        <Copy size={15} />
                        Duplicados
                        {duplicateCount > 0 && (
                          <span className="ml-auto rounded-full bg-navy-700 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-slate-300">
                            {duplicateCount}
                          </span>
                        )}
                      </button>
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
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        {syncMessage && (
          <p className="text-xs text-accent-light -mt-1">{syncMessage}</p>
        )}
        {view === 'home' && (
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre…"
                className="w-full rounded-md border border-navy-700 bg-navy-800 py-1.5 pl-8 pr-8 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-accent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <CategoryTabs value={categoryFilter} onChange={setCategoryFilter} counts={categoryCounts} />
            <StatusTabs value={statusFilter} onChange={setStatusFilter} counts={statusCounts} />
            {statusFilter === 'done' && doneYears.length > 0 && (
              <div className="flex items-center gap-2">
                <DateFilter
                  yearValue={yearFilter}
                  monthValue={monthFilter}
                  onYearChange={setYearFilter}
                  onMonthChange={setMonthFilter}
                  years={doneYears}
                  months={doneMonths}
                />
                <span className="rounded-full bg-navy-700 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-slate-300">
                  {filteredItems.length}
                </span>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col px-4 pt-4 pb-28">
        {view === 'home' && !loading && (
          <div className="flex gap-1 bg-navy-800 rounded-full p-1 self-start mb-3">
            <button
              type="button"
              onClick={() => setColumns(1)}
              aria-label="Ver en 1 columna"
              aria-pressed={columns === 1}
              className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors ${
                columns === 1 ? 'bg-accent text-white' : 'text-slate-400'
              }`}
            >
              <Rows3 size={14} />
            </button>
            <button
              type="button"
              onClick={() => setColumns(2)}
              aria-label="Ver en 2 columnas"
              aria-pressed={columns === 2}
              className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors ${
                columns === 2 ? 'bg-accent text-white' : 'text-slate-400'
              }`}
            >
              <Grid2x2 size={14} />
            </button>
          </div>
        )}
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
            columns={columns}
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
          className="fixed right-5 z-30 h-14 w-14 rounded-full bg-accent text-white flex items-center justify-center shadow-fab active:scale-95 transition-transform fab-safe-bottom"
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

      {duplicatesOpen && (
        <DuplicatesModal
          items={items}
          onClose={() => setDuplicatesOpen(false)}
          onDelete={deleteItem}
        />
      )}
    </div>
  )
}
