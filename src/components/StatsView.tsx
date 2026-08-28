import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Category, Status, TrackedItem } from '@/types'
import { CATEGORY_LABELS } from '@/types'

const STATUS_COLORS: Record<Status, string> = {
  backlog: '#4a5f9e',
  ongoing: '#f59e0b',
  done: '#34d399',
}

const STATUS_ORDER: Status[] = ['backlog', 'ongoing', 'done']
const CATEGORY_ORDER: Category[] = ['books', 'games', 'movies', 'series', 'comics']

const ONE_DAY = 1000 * 60 * 60 * 24

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-navy-850 border border-navy-700/60 rounded-xl p-3.5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-50 mt-1">{value}</p>
      {hint && <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>}
    </div>
  )
}

export default function StatsView({ items }: { items: TrackedItem[] }) {
  const stats = useMemo(() => {
    const total = items.length

    const byStatus: Record<Status, number> = { backlog: 0, ongoing: 0, done: 0 }
    const byCategory: Record<Category, Record<Status, number>> = {
      books: { backlog: 0, ongoing: 0, done: 0 },
      games: { backlog: 0, ongoing: 0, done: 0 },
      movies: { backlog: 0, ongoing: 0, done: 0 },
      series: { backlog: 0, ongoing: 0, done: 0 },
      comics: { backlog: 0, ongoing: 0, done: 0 },
    }

    for (const item of items) {
      byStatus[item.status] += 1
      byCategory[item.category][item.status] += 1
    }

    const now = Date.now()
    const finishedLast7Days = items.filter(
      (i) => i.status === 'done' && now - i.updatedAt <= 7 * ONE_DAY
    ).length
    const finishedLast30Days = items.filter(
      (i) => i.status === 'done' && now - i.updatedAt <= 30 * ONE_DAY
    ).length

    const completionRate = total > 0 ? Math.round((byStatus.done / total) * 100) : 0

    const categoryTotals = CATEGORY_ORDER.map((cat) => ({
      category: cat,
      total: byCategory[cat].backlog + byCategory[cat].ongoing + byCategory[cat].done,
    }))
    const topCategory = categoryTotals.reduce(
      (max, c) => (c.total > max.total ? c : max),
      categoryTotals[0]
    )

    const oldestBacklog = items
      .filter((i) => i.status === 'backlog')
      .sort((a, b) => a.createdAt - b.createdAt)[0]
    const oldestBacklogDays = oldestBacklog
      ? Math.floor((now - oldestBacklog.createdAt) / ONE_DAY)
      : null

    const doneItems = items.filter((i) => i.status === 'done')
    const avgDaysToFinish =
      doneItems.length > 0
        ? Math.round(
            doneItems.reduce((sum, i) => sum + (i.updatedAt - i.createdAt), 0) /
              doneItems.length /
              ONE_DAY
          )
        : null

    const pieData = STATUS_ORDER.map((s) => ({
      name:
        s === 'backlog' ? 'Pendiente' : s === 'ongoing' ? 'En curso' : 'Terminado',
      value: byStatus[s],
      status: s,
    })).filter((d) => d.value > 0)

    const barData = CATEGORY_ORDER.map((cat) => ({
      category: CATEGORY_LABELS[cat],
      Pendiente: byCategory[cat].backlog,
      'En curso': byCategory[cat].ongoing,
      Terminado: byCategory[cat].done,
    }))

    return {
      total,
      byStatus,
      completionRate,
      finishedLast7Days,
      finishedLast30Days,
      topCategory,
      oldestBacklogDays,
      avgDaysToFinish,
      pieData,
      barData,
    }
  }, [items])

  if (stats.total === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
        <p className="text-slate-300 font-medium">Todavía no hay datos</p>
        <p className="text-sm text-slate-500 mt-1">
          Agregá ítems para ver tus estadísticas acá
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total de ítems" value={String(stats.total)} />
        <StatCard
          label="Tasa de finalización"
          value={`${stats.completionRate}%`}
          hint={`${stats.byStatus.done} terminados`}
        />
        <StatCard
          label="Terminados (7 días)"
          value={String(stats.finishedLast7Days)}
          hint={`${stats.finishedLast30Days} en 30 días`}
        />
        <StatCard
          label="Categoría top"
          value={CATEGORY_LABELS[stats.topCategory.category]}
          hint={`${stats.topCategory.total} ítems`}
        />
        {stats.avgDaysToFinish !== null && (
          <StatCard
            label="Promedio para terminar"
            value={`${stats.avgDaysToFinish}d`}
          />
        )}
        {stats.oldestBacklogDays !== null && (
          <StatCard
            label="Pendiente más viejo"
            value={`${stats.oldestBacklogDays}d`}
            hint="esperando en backlog"
          />
        )}
      </div>

      <div className="bg-navy-850 border border-navy-700/60 rounded-xl p-3.5">
        <p className="text-sm font-semibold text-slate-200 mb-2">Por categoría</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.barData} barSize={16} margin={{ left: -8, right: 4, top: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#182247" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#182247' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#182247' }}
                tickLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={{
                  background: '#0d1224',
                  border: '1px solid #182247',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#e2e8f0' }}
                cursor={{ fill: 'rgba(91, 141, 239, 0.06)' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Bar dataKey="Pendiente" stackId="s" fill={STATUS_COLORS.backlog} radius={[0, 0, 0, 0]} />
              <Bar dataKey="En curso" stackId="s" fill={STATUS_COLORS.ongoing} />
              <Bar dataKey="Terminado" stackId="s" fill={STATUS_COLORS.done} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-navy-850 border border-navy-700/60 rounded-xl p-3.5">
        <p className="text-sm font-semibold text-slate-200 mb-2">Estado general</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {stats.pieData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#0d1224',
                  border: '1px solid #182247',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
