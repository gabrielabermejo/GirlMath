import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../context/AuthContext'
import { useFilters } from '../../../context/FiltersContext'
import {
  Income, Expense, FixedExpense, CategoryTotal, MonthlyBalance,
  SavingsStats, CATEGORY_LABELS, CATEGORY_COLORS, ExpenseCategory,
} from '../../../types'
import { MONTHS } from '../../../lib/utils'

export function useDashboardStats() {
  const { user } = useAuth()
  const { filters, savingsGoal } = useFilters()
  const qc = useQueryClient()

  const allIncomes = qc.getQueryData<Income[]>(['incomes', user?.id]) ?? []
  const allExpenses = qc.getQueryData<Expense[]>(['expenses', user?.id]) ?? []
  const fixedExpenses = qc.getQueryData<FixedExpense[]>(['fixed_expenses', user?.id]) ?? []

  const monthIncomes = useMemo(() =>
    allIncomes.filter((i) => {
      const d = new Date(i.date + 'T00:00:00')
      return d.getMonth() === filters.month && d.getFullYear() === filters.year
    }),
    [allIncomes, filters.month, filters.year],
  )

  const monthExpenses = useMemo(() =>
    allExpenses.filter((e) => {
      const d = new Date(e.date + 'T00:00:00')
      return d.getMonth() === filters.month && d.getFullYear() === filters.year
    }),
    [allExpenses, filters.month, filters.year],
  )

  const totalIncome = useMemo(
    () => monthIncomes.reduce((s, i) => s + i.amount, 0),
    [monthIncomes],
  )

  const totalVariableExpenses = useMemo(
    () => monthExpenses.reduce((s, e) => s + e.amount, 0),
    [monthExpenses],
  )

  const totalFixedExpenses = useMemo(
    () => fixedExpenses.reduce((s, e) => s + e.amount, 0),
    [fixedExpenses],
  )

  const totalExpenses = totalVariableExpenses + totalFixedExpenses
  const balance = totalIncome - totalExpenses

  const savings = useMemo((): SavingsStats => {
    const goalAmount = totalIncome * (savingsGoal / 100)
    const totalSpent = totalExpenses
    const remaining = totalIncome - goalAmount - totalSpent
    const savedAmount = Math.max(0, totalIncome - totalSpent)
    const savedPct = totalIncome > 0 ? (savedAmount / totalIncome) * 100 : 0
    return {
      goalPct: savingsGoal,
      goalAmount,
      totalSpent,
      remaining,
      onTrack: remaining >= 0,
      savedAmount,
      savedPct,
    }
  }, [totalIncome, totalExpenses, savingsGoal])

  const expensesByCategory = useMemo((): CategoryTotal[] => {
    const map: Partial<Record<ExpenseCategory, number>> = {}
    monthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount
    })
    fixedExpenses.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount
    })
    return (Object.entries(map) as [ExpenseCategory, number][])
      .map(([cat, total]) => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        total,
        color: CATEGORY_COLORS[cat],
      }))
      .sort((a, b) => b.total - a.total)
  }, [monthExpenses, fixedExpenses])

  const monthlyBalances = useMemo((): MonthlyBalance[] => {
    const result: MonthlyBalance[] = []
    const fixedTotal = fixedExpenses.reduce((s, e) => s + e.amount, 0)
    const today = new Date()
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const m = date.getMonth()
      const y = date.getFullYear()
      const inc = allIncomes
        .filter((x) => {
          const d = new Date(x.date + 'T00:00:00')
          return d.getMonth() === m && d.getFullYear() === y
        })
        .reduce((s, x) => s + x.amount, 0)
      const varExp = allExpenses
        .filter((x) => {
          const d = new Date(x.date + 'T00:00:00')
          return d.getMonth() === m && d.getFullYear() === y
        })
        .reduce((s, x) => s + x.amount, 0)
      const exp = varExp + fixedTotal
      result.push({
        label: `${MONTHS[m].slice(0, 3)} ${String(y).slice(2)}`,
        income: inc,
        expenses: exp,
        balance: inc - exp,
      })
    }
    return result
  }, [allIncomes, allExpenses, fixedExpenses])

  return {
    totalIncome,
    totalVariableExpenses,
    totalFixedExpenses,
    totalExpenses,
    balance,
    savings,
    expensesByCategory,
    monthlyBalances,
  }
}
