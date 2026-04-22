import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, RepeatIcon, PiggyBank, Pencil, Check, X, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import Header from '../../components/layout/Header'
import StatCard from '../../components/ui/StatCard'
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

  const balanceVariant = balance >= 0 ? 'balance-positive' : 'balance-negative'

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Balance del mes"
            value={formatCurrency(balance)}
            subtext={balance >= 0 ? 'Saldo positivo ✓' : 'Saldo negativo'}
            icon={<Wallet size={18} className="text-white" />}
            variant={balanceVariant}
          />
          <StatCard
            label="Ingresos"
            value={formatCurrency(totalIncome)}
            icon={<TrendingUp size={18} className="text-emerald-600" />}
            variant="income"
          />
          <StatCard
            label="Gastos variables"
            value={formatCurrency(totalVariableExpenses)}
            icon={<TrendingDown size={18} className="text-pink-400" />}
            variant="expense"
          />
          <StatCard
            label="Gastos fijos"
            value={formatCurrency(totalFixedExpenses)}
            subtext="Recurrentes mensuales"
            icon={<RepeatIcon size={18} className="text-violet-600" />}
            variant="default"
          />
        </div>

        {/* Savings card */}
        <div
          className={clsx(
            'rounded-2xl border p-5 shadow-sm',
            savings.onTrack
              ? 'border-green-100 bg-green-50'
              : 'border-violet-100 bg-violet-50',
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank
                size={20}
                className={savings.onTrack ? 'text-green-500' : 'text-violet-400'}
              />
              <span className="font-semibold text-gray-800">Meta de ahorro</span>
            </div>

            {/* Goal % editor */}
            <div className="flex items-center gap-1.5">
              {editingGoal ? (
                <>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-16 rounded border border-gray-300 px-2 py-0.5 text-center text-sm"
                    value={goalDraft}
                    onChange={(e) => setGoalDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmGoalEdit()
                      if (e.key === 'Escape') setEditingGoal(false)
                    }}
                    autoFocus
                  />
                  <span className="text-sm text-gray-500">%</span>
                  <button
                    onClick={confirmGoalEdit}
                    className="rounded p-1 text-emerald-600 hover:bg-emerald-100"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setEditingGoal(false)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setGoalDraft(String(savingsGoal)); setEditingGoal(true) }}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-gray-600 hover:bg-black/5"
                >
                  <span>{savingsGoal}% de ahorro</span>
                  <Pencil size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Meta de ahorro</p>
              <p className="text-base font-bold text-gray-800">{formatCurrency(savings.goalAmount)}</p>
              <p className="text-xs text-gray-400">{savingsGoal}% del ingreso</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total gastado</p>
              <p className="text-base font-bold text-gray-800">{formatCurrency(savings.totalSpent)}</p>
              <p className="text-xs text-gray-400">Variables + fijos</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Margen disponible</p>
              <p
                className={clsx(
                  'text-base font-bold',
                  savings.remaining >= 0 ? 'text-green-600' : 'text-violet-500',
                )}
              >
                {formatCurrency(savings.remaining)}
              </p>
              <p className="text-xs text-gray-400">
                {savings.remaining >= 0 ? 'Puedes gastar más' : 'Te excediste'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ahorro real</p>
              <p
                className={clsx(
                  'text-base font-bold',
                  savings.savedPct >= savingsGoal ? 'text-green-600' : 'text-blue-400',
                )}
              >
                {savings.savedPct.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-400">{formatCurrency(savings.savedAmount)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>Gasto del ingreso disponible para gastar</span>
              <span>
                {totalIncome > 0
                  ? Math.min(100, (savings.totalSpent / (totalIncome - savings.goalAmount)) * 100).toFixed(0)
                  : 0}
                %
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={clsx(
                  'h-full rounded-full transition-all',
                  savings.onTrack ? 'bg-green-300' : 'bg-violet-300',
                )}
                style={{
                  width: `${totalIncome > 0
                    ? Math.min(100, (savings.totalSpent / (totalIncome - savings.goalAmount)) * 100)
                    : 0}%`,
                }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>0%</span>
              <span className={savings.onTrack ? 'text-green-600 font-medium' : 'text-violet-500 font-medium'}>
                {savings.onTrack
                  ? `Vas bien — te quedan ${formatCurrency(savings.remaining)} para gastar`
                  : `Te excediste en ${formatCurrency(Math.abs(savings.remaining))}`}
              </span>
              <span>100%</span>
            </div>
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
