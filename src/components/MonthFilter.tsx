const MONTH_LABELS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export type MonthKey = string // 'YYYY-MM'
export type YearKey = string // 'YYYY'
export type MonthOnlyKey = string // '01'..'12'

export function monthKeyOf(epochMs: number): MonthKey {
  const d = new Date(epochMs)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function yearOf(key: MonthKey): YearKey {
  return key.split('-')[0]
}

export function monthOnlyOf(key: MonthKey): MonthOnlyKey {
  return key.split('-')[1]
}

export function monthOnlyLabel(month: MonthOnlyKey): string {
  return MONTH_LABELS[Number(month) - 1]
}

export function DateFilter({
  yearValue,
  monthValue,
  onYearChange,
  onMonthChange,
  years,
  months,
}: {
  yearValue: 'all' | YearKey
  monthValue: 'all' | MonthOnlyKey
  onYearChange: (v: 'all' | YearKey) => void
  onMonthChange: (v: 'all' | MonthOnlyKey) => void
  years: YearKey[]
  months: MonthOnlyKey[]
}) {
  if (years.length === 0) return null

  return (
    <div className="flex gap-2">
      <select
        value={yearValue}
        onChange={(e) => onYearChange(e.target.value as 'all' | YearKey)}
        className="rounded-md border border-navy-700 bg-navy-800 px-2.5 py-1 text-xs font-medium text-slate-300"
      >
        <option value="all">Todos los años</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <select
        value={monthValue}
        onChange={(e) => onMonthChange(e.target.value as 'all' | MonthOnlyKey)}
        className="rounded-md border border-navy-700 bg-navy-800 px-2.5 py-1 text-xs font-medium text-slate-300"
      >
        <option value="all">Todos los meses</option>
        {months.map((m) => (
          <option key={m} value={m}>
            {monthOnlyLabel(m)}
          </option>
        ))}
      </select>
    </div>
  )
}
