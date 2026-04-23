import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, RepeatIcon, PiggyBank, Pencil, Check, X, AlertTriangle, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import Header from '../../components/layout/Header'
import ExpensePieChart from './components/ExpensePieChart'
import BalanceLineChart from './components/BalanceLineChart'
import BudgetAlertModal from './components/BudgetAlertModal'
import { useDashboardStats } from './hooks/useDashboardStats'
import { useFilters } from '../../context/FiltersContext'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Income, Expense, FixedExpense } from '../../types'
import { MONTHS, formatCurrency } from '../../lib/utils'
import clsx from 'clsx'

export default function DashboardPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { filters, setMonth, setYear, savingsGoal, setSavingsGoal } = useFilters()
  const {
    totalIncome,
    totalVariableExpenses,
    totalFixedExpenses,
    totalExpenses,
    balance,
    savings,
    expensesByCategory,
    monthlyBalances,
  } = useDashboardStats()

  const [editingGoal, setEditingGoal] = useState(false)
  const [goalDraft, setGoalDraft] = useState(String(savingsGoal))
  const [loginAlertOpen, setLoginAlertOpen] = useState(false)

  function confirmGoalEdit() {
    const n = Number(goalDraft)
    if (!isNaN(n) && n >= 0 && n <= 100) setSavingsGoal(n)
    setEditingGoal(false)
  }

  useEffect(() => {
    if (!user) return
    if (!qc.getQueryData(['incomes', user.id])) {
      qc.fetchQuery({
        queryKey: ['incomes', user.id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('incomes')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
          if (error) throw error
          return data as Income[]
        },
        staleTime: 1000 * 60 * 5,
      })
    }
    if (!qc.getQueryData(['expenses', user.id])) {
      qc.fetchQuery({
        queryKey: ['expenses', user.id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
          if (error) throw error
          return data as Expense[]
        },
        staleTime: 1000 * 60 * 5,
      })
    }
    if (!qc.getQueryData(['fixed_expenses', user.id])) {
      qc.fetchQuery({
        queryKey: ['fixed_expenses', user.id],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('fixed_expenses')
            .select('*')
            .eq('user_id', user.id)
            .order('description', { ascending: true })
          if (error) throw error
          return data as FixedExpense[]
        },
        staleTime: 1000 * 60 * 5,
      })
    }
  }, [user, qc])

  const availableBudget = totalIncome - savings.goalAmount
  const spentPct = availableBudget > 0 ? (savings.totalSpent / availableBudget) * 100 : 0

  type AlertLevel = 'exceeded' | 'critical' | 'warning' | null
  const alertLevel: AlertLevel =
    totalIncome === 0 ? null
    : spentPct >= 100 ? 'exceeded'
    : spentPct >= 90  ? 'critical'
    : spentPct >= 75  ? 'warning'
    : null

  // Show login alert once per session when budget is tight
  useEffect(() => {
    if (totalIncome === 0) return
    if (sessionStorage.getItem('budget_alert_shown')) return
    if (alertLevel) {
      setLoginAlertOpen(true)
      sessionStorage.setItem('budget_alert_shown', '1')
    }
  }, [totalIncome, alertLevel])

  const alertConfig = {
    exceeded: {
      icon: ShieldAlert,
      bg: 'bg-violet-50 border-violet-300',
      iconColor: 'text-violet-400',
      titleColor: 'text-violet-700',
      textColor: 'text-violet-600',
      barColor: 'bg-violet-300',
      title: '¡Superaste tu presupuesto disponible!',
      message: `Llevas gastado ${formatCurrency(savings.totalSpent)} de un presupuesto de ${formatCurrency(availableBudget)} (${spentPct.toFixed(0)}%). Tu meta de ahorro del ${savingsGoal}% está en riesgo. Evita nuevos gastos este mes.`,
    },
    critical: {
      icon: AlertCircle,
      bg: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-600',
      textColor: 'text-blue-500',
      barColor: 'bg-blue-300',
      title: 'Estás casi en tu límite de gasto',
      message: `Has usado el ${spentPct.toFixed(0)}% de tu presupuesto disponible. Solo te quedan ${formatCurrency(savings.remaining)} para gastar y respetar tu meta de ahorro del ${savingsGoal}%.`,
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-600',
      textColor: 'text-yellow-500',
      barColor: 'bg-yellow-300',
      title: 'El presupuesto disponible se está agotando',
      message: `Llevas el ${spentPct.toFixed(0)}% del presupuesto gastado. Te quedan ${formatCurrency(savings.remaining)} disponibles. Modera tus gastos para alcanzar tu meta de ahorro del ${savingsGoal}%.`,
    },
  } as const

  return (
    <>
    <div>
      <Header title="Dashboard" subtitle={`${MONTHS[filters.month]} ${filters.year}`} />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Month/Year filter */}
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

        {/* Budget alert */}
        {alertLevel && (() => {
          const cfg = alertConfig[alertLevel]
          const Icon = cfg.icon
          return (
            <div className={clsx('rounded-xl border-l-4 p-4 shadow-sm', cfg.bg)}>
              <div className="flex items-start gap-3">
                <Icon size={22} className={clsx('mt-0.5 shrink-0', cfg.iconColor)} />
                <div className="flex-1 min-w-0">
                  <p className={clsx('font-semibold text-sm', cfg.titleColor)}>
                    {cfg.title}
                  </p>
                  <p className={clsx('mt-0.5 text-sm', cfg.textColor)}>
                    {cfg.message}
                  </p>
                  {/* Mini progress bar inside alert */}
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/10">
                    <div
                      className={clsx('h-full rounded-full transition-all', cfg.barColor)}
                      style={{ width: `${Math.min(spentPct, 100)}%` }}
                    />
                  </div>
                  <p className={clsx('mt-1 text-xs', cfg.textColor)}>
                    {Math.min(spentPct, 100).toFixed(0)}% del presupuesto disponible usado
                    {spentPct > 100 && ` (+${(spentPct - 100).toFixed(0)}% sobre el límite)`}
                  </p>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Main stat cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {/* Balance */}
          <div
            className="rounded-2xl border p-4 shadow-sm"
            style={{
              background: balance >= 0 ? '#f0fdf4' : '#fff1f2',
              borderColor: balance >= 0 ? '#bbf7d0' : '#fecdd3',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">Balance</p>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-xl"
                style={{ background: balance >= 0 ? '#dcfce7' : '#ffe4e6' }}
              >
                <Wallet size={14} style={{ color: balance >= 0 ? '#16a34a' : '#e11d48' }} />
              </div>
            </div>
            <p className="text-base font-bold truncate" style={{ color: balance >= 0 ? '#16a34a' : '#e11d48' }}>
              {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: balance >= 0 ? '#86efac' : '#fca5a5' }}>
              {balance >= 0 ? 'Saldo positivo ✓' : 'Saldo negativo'}
            </p>
          </div>

          {/* Ingresos */}
          <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">Ingresos</p>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-green-50">
                <TrendingUp size={14} className="text-green-500" />
              </div>
            </div>
            <p className="text-base font-bold text-green-500 truncate">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-gray-300 mt-0.5">Este mes</p>
          </div>

          {/* Gastos variables */}
          <div className="rounded-2xl border border-pink-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">Gastos var.</p>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-pink-50">
                <TrendingDown size={14} className="text-pink-400" />
              </div>
            </div>
            <p className="text-base font-bold text-pink-500 truncate">{formatCurrency(totalVariableExpenses)}</p>
            <p className="text-xs text-gray-300 mt-0.5">Variables</p>
          </div>

          {/* Gastos fijos */}
          <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">Gastos fijos</p>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-50">
                <RepeatIcon size={14} className="text-violet-400" />
              </div>
            </div>
            <p className="text-base font-bold text-violet-500 truncate">{formatCurrency(totalFixedExpenses)}</p>
            <p className="text-xs text-gray-300 mt-0.5">Recurrentes</p>
          </div>
        </div>

        {/* Savings card */}
        <style>{`
          @keyframes sparkle-pop {
            0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
            50%       { opacity: 1; transform: scale(1.2) rotate(20deg); }
          }
          @keyframes bar-shimmer {
            0%   { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          .savings-sparkle { animation: sparkle-pop ease-in-out infinite; }
          .bar-shimmer-fill {
            background: linear-gradient(90deg, #f9a8d4 0%, #e879f9 30%, #a78bfa 60%, #f9a8d4 100%);
            background-size: 200% auto;
            animation: bar-shimmer 2.5s linear infinite;
          }
          .bar-shimmer-fill-warn {
            background: linear-gradient(90deg, #c084fc 0%, #f472b6 40%, #fb923c 70%, #c084fc 100%);
            background-size: 200% auto;
            animation: bar-shimmer 2.5s linear infinite;
          }
        `}</style>

        <div
          className="relative overflow-hidden rounded-3xl p-5 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 50%, #fdf4ff 100%)', border: '1.5px solid #f9a8d460' }}
        >
          {/* Sparkle decorations */}
          {[
            { top: '10%', left: '6%',  size: 10, delay: '0s',    dur: '2.2s'  },
            { top: '15%', left: '88%', size: 8,  delay: '0.4s',  dur: '1.8s'  },
            { top: '70%', left: '92%', size: 12, delay: '0.9s',  dur: '2.6s'  },
            { top: '80%', left: '4%',  size: 7,  delay: '1.3s',  dur: '2s'    },
            { top: '45%', left: '96%', size: 6,  delay: '0.6s',  dur: '1.5s'  },
          ].map((s, i) => (
            <Sparkles
              key={i}
              size={s.size}
              className="savings-sparkle absolute pointer-events-none text-pink-300"
              style={{ top: s.top, left: s.left, animationDelay: s.delay, animationDuration: s.dur }}
            />
          ))}

          {/* Header */}
          <div className="mb-4 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl shadow-sm" style={{ background: 'linear-gradient(135deg,#f9a8d4,#c084fc)' }}>
                <PiggyBank size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800 leading-tight">Meta de ahorro</p>
                <p className="text-xs text-pink-400">✨ Tu plan financiero</p>
              </div>
            </div>

            {/* Goal % editor */}
            <div className="flex items-center gap-1.5">
              {editingGoal ? (
                <>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-14 rounded-xl border border-pink-200 bg-white/80 px-2 py-0.5 text-center text-sm font-semibold text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    value={goalDraft}
                    onChange={(e) => setGoalDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmGoalEdit()
                      if (e.key === 'Escape') setEditingGoal(false)
                    }}
                    autoFocus
                  />
                  <span className="text-sm text-pink-400 font-bold">%</span>
                  <button onClick={confirmGoalEdit} className="rounded-lg p-1 text-pink-500 hover:bg-pink-100">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingGoal(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setGoalDraft(String(savingsGoal)); setEditingGoal(true) }}
                  className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition"
                  style={{ background: 'rgba(249,168,212,0.2)', color: '#db2777', border: '1px solid #f9a8d460' }}
                >
                  <span>{savingsGoal}% ahorro</span>
                  <Pencil size={10} />
                </button>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-5 relative z-10">
            {[
              { label: 'Meta ahorro',   value: formatCurrency(savings.goalAmount),  sub: `${savingsGoal}% del ingreso`, color: '#ec4899' },
              { label: 'Total gastado', value: formatCurrency(savings.totalSpent),   sub: 'Variables + fijos',           color: '#a855f7' },
              { label: 'Disponible',    value: formatCurrency(savings.remaining),    sub: savings.remaining >= 0 ? 'Puedes gastar más' : 'Te excediste', color: savings.remaining >= 0 ? '#10b981' : '#f97316' },
              { label: 'Ahorro real',   value: `${savings.savedPct.toFixed(0)}%`,    sub: formatCurrency(savings.savedAmount), color: savings.savedPct >= savingsGoal ? '#10b981' : '#8b5cf6' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-3"
                style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(249,168,212,0.25)' }}
              >
                <p className="text-xs text-gray-400 mb-0.5">{stat.label}</p>
                <p className="text-sm font-bold truncate" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-gray-400 truncate">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="relative z-10">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-pink-500">Presupuesto usado</span>
              <span className="text-xs font-bold" style={{ color: savings.onTrack ? '#ec4899' : '#f97316' }}>
                {totalIncome > 0
                  ? Math.min(100, (savings.totalSpent / (totalIncome - savings.goalAmount)) * 100).toFixed(0)
                  : 0}%
              </span>
            </div>

            {/* Track */}
            <div className="relative h-4 w-full overflow-hidden rounded-full" style={{ background: 'rgba(249,168,212,0.2)' }}>
              {/* Fill with shimmer */}
              <div
                className={savings.onTrack ? 'bar-shimmer-fill' : 'bar-shimmer-fill-warn'}
                style={{
                  height: '100%',
                  borderRadius: '9999px',
                  width: `${totalIncome > 0
                    ? Math.min(100, (savings.totalSpent / (totalIncome - savings.goalAmount)) * 100)
                    : 0}%`,
                  transition: 'width 0.8s ease',
                }}
              />
              {/* Gloss overlay */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 60%)' }}
              />
            </div>

            <p className="mt-2 text-center text-xs font-semibold" style={{ color: savings.onTrack ? '#ec4899' : '#f97316' }}>
              {savings.onTrack
                ? `✨ Vas bien — te quedan ${formatCurrency(savings.remaining)} para gastar`
                : `⚠️ Te excediste en ${formatCurrency(Math.abs(savings.remaining))}`}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">
              Gastos por categoría (variables + fijos)
            </h3>
            <ExpensePieChart data={expensesByCategory} />
          </div>
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">
              Evolución últimos 12 meses
            </h3>
            <BalanceLineChart data={monthlyBalances} />
          </div>
        </div>

        {/* Category breakdown */}
        {expensesByCategory.length > 0 && (
          <div className="card p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">
              Desglose por categoría
            </h3>
            <div className="space-y-2">
              {expensesByCategory.map((cat) => {
                const pct = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0
                return (
                  <div key={cat.category}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{cat.label}</span>
                      <span className="text-gray-500">
                        {formatCurrency(cat.total)}{' '}
                        <span className="text-xs text-gray-400">({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>

    {loginAlertOpen && alertLevel && (
      <BudgetAlertModal
        level={alertLevel}
        spentPct={spentPct}
        totalSpent={savings.totalSpent}
        availableBudget={availableBudget}
        remaining={savings.remaining}
        savingsGoal={savingsGoal}
        onClose={() => setLoginAlertOpen(false)}
      />
    )}
    </>
  )
}
