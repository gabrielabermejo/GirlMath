import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, RepeatIcon } from 'lucide-react'
import { useIncomes } from '../income/hooks/useIncomes'
import { useExpenses } from '../expenses/hooks/useExpenses'
import { useFixedExpenses } from '../fixed-expenses/hooks/useFixedExpenses'
import { formatCurrency } from '../../lib/utils'
import { CATEGORY_LABELS, ExpenseCategory } from '../../types'

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

interface DayData {
  incomes:  { id: string; description: string; amount: number }[]
  expenses: { id: string; description: string; amount: number; category: string }[]
  fixed:    { id: string; description: string; amount: number }[]
}

export default function CalendarioPage() {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<number | null>(null)

  // Fetch all data (unfiltered by FiltersContext so we use raw query data)
  const { data: allIncomes  = [] } = useIncomes()
  const { data: allExpenses = [] } = useExpenses()
  const { data: allFixed    = [] } = useFixedExpenses()

  // Build map: day → transactions
  const dayMap = useMemo(() => {
    const map: Record<number, DayData> = {}
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) map[d] = { incomes: [], expenses: [], fixed: [] }

    allIncomes.forEach((i) => {
      const d = new Date(i.date + 'T00:00:00')
      if (d.getFullYear() === year && d.getMonth() === month) {
        map[d.getDate()].incomes.push({ id: i.id, description: i.description, amount: i.amount })
      }
    })

    allExpenses.forEach((e) => {
      const d = new Date(e.date + 'T00:00:00')
      if (d.getFullYear() === year && d.getMonth() === month) {
        map[d.getDate()].expenses.push({ id: e.id, description: e.description, amount: e.amount, category: e.category })
      }
    })

    allFixed.forEach((f) => {
      if (f.day_of_month && f.day_of_month <= daysInMonth) {
        map[f.day_of_month].fixed.push({ id: f.id, description: f.description, amount: f.amount })
      }
    })

    return map
  }, [allIncomes, allExpenses, allFixed, year, month])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelected(null)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth    = new Date(year, month + 1, 0).getDate()

  const selectedData = selected ? dayMap[selected] : null
  const selectedTotal = selectedData
    ? selectedData.incomes.reduce((s, i) => s + i.amount, 0)
      - selectedData.expenses.reduce((s, e) => s + e.amount, 0)
      - selectedData.fixed.reduce((s, f) => s + f.amount, 0)
    : 0

  const monthTotalIncome   = Object.values(dayMap).reduce((s, d) => s + d.incomes.reduce((a, i) => a + i.amount, 0), 0)
  const monthTotalExpenses = Object.values(dayMap).reduce((s, d) => s + d.expenses.reduce((a, e) => a + e.amount, 0) + d.fixed.reduce((a, f) => a + f.amount, 0), 0)

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 pb-32 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Calendario</h1>
        <p className="text-sm text-pink-400">Vista mensual de tus movimientos</p>
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-green-100 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Ingresos</p>
          <p className="text-sm font-bold text-green-500 truncate">{formatCurrency(monthTotalIncome)}</p>
        </div>
        <div className="rounded-2xl border border-pink-100 bg-white p-3 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Gastos</p>
          <p className="text-sm font-bold text-pink-500 truncate">{formatCurrency(monthTotalExpenses)}</p>
        </div>
        <div
          className="rounded-2xl p-3 shadow-sm border"
          style={{
            background: monthTotalIncome - monthTotalExpenses >= 0 ? '#f0fdf4' : '#fff1f2',
            borderColor: monthTotalIncome - monthTotalExpenses >= 0 ? '#bbf7d0' : '#fecdd3',
          }}
        >
          <p className="text-xs text-gray-400 mb-1">Balance</p>
          <p className="text-sm font-bold truncate" style={{ color: monthTotalIncome - monthTotalExpenses >= 0 ? '#16a34a' : '#e11d48' }}>
            {formatCurrency(monthTotalIncome - monthTotalExpenses)}
          </p>
        </div>
      </div>

      {/* Calendar card */}
      <div className="rounded-3xl bg-white border border-pink-100 shadow-sm overflow-hidden">
        {/* Nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-pink-50">
          <button onClick={prevMonth} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-pink-50 transition">
            <ChevronLeft size={18} className="text-pink-400" />
          </button>
          <p className="text-base font-bold text-gray-800">
            {MONTH_NAMES[month]} {year}
          </p>
          <button onClick={nextMonth} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-pink-50 transition">
            <ChevronRight size={18} className="text-pink-400" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 border-b border-pink-50">
          {DAY_NAMES.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-pink-300">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const data     = dayMap[day]
            const hasInc   = data.incomes.length > 0
            const hasExp   = data.expenses.length > 0
            const hasFix   = data.fixed.length > 0
            const isToday  = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            const isSel    = selected === day
            const dayBal   = data.incomes.reduce((s, i) => s + i.amount, 0)
                           - data.expenses.reduce((s, e) => s + e.amount, 0)
                           - data.fixed.reduce((s, f) => s + f.amount, 0)
            const hasAny   = hasInc || hasExp || hasFix

            return (
              <button
                key={day}
                onClick={() => setSelected(isSel ? null : day)}
                className="relative flex flex-col items-center pt-2 pb-1.5 gap-1 transition"
                style={{
                  background: isSel
                    ? 'linear-gradient(135deg,#fdf2f8,#f5f3ff)'
                    : 'transparent',
                  borderRadius: isSel ? '16px' : undefined,
                }}
              >
                {/* Day number */}
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition"
                  style={{
                    background: isToday ? 'linear-gradient(135deg,#ec4899,#a855f7)' : 'transparent',
                    color: isToday ? 'white' : isSel ? '#ec4899' : '#374151',
                  }}
                >
                  {day}
                </span>

                {/* Dots */}
                {hasAny && (
                  <div className="flex gap-0.5 justify-center">
                    {hasInc && <span className="h-1.5 w-1.5 rounded-full bg-green-400" />}
                    {(hasExp) && <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />}
                    {hasFix && <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />}
                  </div>
                )}

                {/* Balance mini */}
                {hasAny && (
                  <span
                    className="text-[9px] font-semibold leading-none"
                    style={{ color: dayBal >= 0 ? '#16a34a' : '#e11d48' }}
                  >
                    {dayBal >= 0 ? '+' : ''}{dayBal >= 1000 || dayBal <= -1000
                      ? `${(dayBal / 1000).toFixed(1)}k`
                      : dayBal.toFixed(0)}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 py-3 border-t border-pink-50">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs text-gray-400">Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-pink-400" />
            <span className="text-xs text-gray-400">Gastos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-violet-400" />
            <span className="text-xs text-gray-400">Fijos</span>
          </div>
        </div>
      </div>

      {/* Detail panel for selected day */}
      {selected && selectedData && (
        <div className="rounded-3xl border border-pink-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-pink-50">
            <div>
              <p className="font-bold text-gray-800">
                {selected} de {MONTH_NAMES[month]}
              </p>
              <p className="text-xs" style={{ color: selectedTotal >= 0 ? '#16a34a' : '#e11d48' }}>
                Balance del día: {selectedTotal >= 0 ? '+' : ''}{formatCurrency(selectedTotal)}
              </p>
            </div>
          </div>

          {selectedData.incomes.length === 0 && selectedData.expenses.length === 0 && selectedData.fixed.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-gray-300">
              <p className="text-sm">Sin movimientos este día</p>
            </div>
          ) : (
            <div className="divide-y divide-pink-50">
              {selectedData.incomes.map((i) => (
                <div key={i.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-green-50">
                    <TrendingUp size={14} className="text-green-500" />
                  </div>
                  <p className="flex-1 text-sm text-gray-700 truncate">{i.description}</p>
                  <span className="text-sm font-bold text-green-500">+{formatCurrency(i.amount)}</span>
                </div>
              ))}
              {selectedData.expenses.map((e) => (
                <div key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-pink-50">
                    <TrendingDown size={14} className="text-pink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{e.description}</p>
                    <p className="text-xs text-gray-400">{CATEGORY_LABELS[e.category as ExpenseCategory] ?? e.category}</p>
                  </div>
                  <span className="text-sm font-bold text-pink-500">-{formatCurrency(e.amount)}</span>
                </div>
              ))}
              {selectedData.fixed.map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                    <RepeatIcon size={14} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{f.description}</p>
                    <p className="text-xs text-violet-300">Gasto fijo</p>
                  </div>
                  <span className="text-sm font-bold text-violet-500">-{formatCurrency(f.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
