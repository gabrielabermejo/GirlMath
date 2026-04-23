import { useMemo } from 'react'
import { useIncomes } from '../../income/hooks/useIncomes'
import { useExpenses } from '../../expenses/hooks/useExpenses'

export type MovimientoType = 'income' | 'expense'

export interface Movimiento {
  id: string
  type: MovimientoType
  amount: number
  description: string
  category: string | null
  date: string
}

export function useMovimientos() {
  const incomes = useIncomes()
  const expenses = useExpenses()

  const all = useMemo((): Movimiento[] => {
    const inc: Movimiento[] = (incomes.filtered ?? []).map((i) => ({
      id: i.id,
      type: 'income',
      amount: i.amount,
      description: i.description,
      category: i.category,
      date: i.date,
    }))
    const exp: Movimiento[] = (expenses.filtered ?? []).map((e) => ({
      id: e.id,
      type: 'expense',
      amount: e.amount,
      description: e.description,
      category: e.category,
      date: e.date,
    }))
    return [...inc, ...exp].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [incomes.filtered, expenses.filtered])

  const totalIngresos = useMemo(
    () => all.filter((m) => m.type === 'income').reduce((s, m) => s + m.amount, 0),
    [all]
  )
  const totalGastos = useMemo(
    () => all.filter((m) => m.type === 'expense').reduce((s, m) => s + m.amount, 0),
    [all]
  )

  const isLoading = incomes.isLoading || expenses.isLoading

  return { all, totalIngresos, totalGastos, balance: totalIngresos - totalGastos, isLoading }
}
