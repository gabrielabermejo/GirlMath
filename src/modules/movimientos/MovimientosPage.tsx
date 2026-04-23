import { useState } from 'react'
import { TrendingUp, TrendingDown, ArrowUpDown, Wallet } from 'lucide-react'
import { useMovimientos, MovimientoType } from './hooks/useMovimientos'
import { useFilters } from '../../context/FiltersContext'
import { CATEGORY_LABELS, ExpenseCategory } from '../../types'
import { formatCurrency, MONTHS } from '../../lib/utils'

type Filter = 'all' | MovimientoType

const MONTH_NAMES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

export default function MovimientosPage() {
  const { filters, setMonth, setYear } = useFilters()
  const { all, totalIngresos, totalGastos, balance, isLoading } = useMovimientos()
  const [filter, setFilter] = useState<Filter>('all')

  const visible = filter === 'all' ? all : all.filter((m) => m.type === filter)

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 pb-32 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Movimientos</h1>
        <p className="text-sm text-pink-400">Ingresos y gastos combinados</p>
      </div>

      {/* Month/Year selector */}
      <div className="flex gap-2">
        <select
          className="input w-auto"
          value={filters.month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>
        <select
          className="input w-auto"
          value={filters.year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2023, 2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-green-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Ingresos</p>
          <p className="text-sm font-bold text-green-500 truncate">{formatCurrency(totalIngresos)}</p>
        </div>
        <div className="rounded-2xl bg-white border border-pink-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Gastos</p>
          <p className="text-sm font-bold text-pink-500 truncate">{formatCurrency(totalGastos)}</p>
        </div>
        <div
          className="rounded-2xl p-4 shadow-sm border"
          style={{
            background: balance >= 0 ? '#f0fdf4' : '#fff1f2',
            borderColor: balance >= 0 ? '#bbf7d0' : '#fecdd3',
          }}
        >
          <p className="text-xs text-gray-400 mb-1">Balance</p>
          <p
            className="text-sm font-bold truncate"
            style={{ color: balance >= 0 ? '#16a34a' : '#e11d48' }}
          >
            {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'income', 'expense'] as Filter[]).map((f) => {
          const labels: Record<Filter, string> = { all: 'Todos', income: 'Ingresos', expense: 'Gastos' }
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-xl px-4 py-1.5 text-sm font-semibold transition"
              style={{
                background: active
                  ? f === 'income' ? '#dcfce7' : f === 'expense' ? '#ffe4e6' : 'linear-gradient(135deg,#ec4899,#a855f7)'
                  : '#f9fafb',
                color: active
                  ? f === 'income' ? '#16a34a' : f === 'expense' ? '#e11d48' : 'white'
                  : '#9ca3af',
                border: active ? 'none' : '1px solid #f3f4f6',
              }}
            >
              {labels[f]}
            </button>
          )
        })}
        <span className="ml-auto text-xs text-gray-400">
          {visible.length} movimiento{visible.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16 text-pink-300">
          <ArrowUpDown size={28} className="animate-pulse" />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-300">
          <Wallet size={40} />
          <p className="text-sm font-medium">Sin movimientos este mes</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((m) => {
            const isIncome = m.type === 'income'
            const catLabel = m.category
              ? (CATEGORY_LABELS[m.category as ExpenseCategory] ?? m.category)
              : null
            return (
              <div
                key={`${m.type}-${m.id}`}
                className="flex items-center gap-3 rounded-2xl bg-white border border-pink-50 px-4 py-3 shadow-sm"
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: isIncome ? '#dcfce7' : '#ffe4e6' }}
                >
                  {isIncome
                    ? <TrendingUp size={17} className="text-green-500" />
                    : <TrendingDown size={17} className="text-pink-500" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{m.description}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-gray-400">{formatDate(m.date)}</span>
                    {catLabel && (
                      <>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{catLabel}</span>
                      </>
                    )}
                  </div>
                </div>

                <span
                  className="text-sm font-bold shrink-0"
                  style={{ color: isIncome ? '#16a34a' : '#e11d48' }}
                >
                  {isIncome ? '+' : '-'}{formatCurrency(m.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
