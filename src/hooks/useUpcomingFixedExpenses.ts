import { useMemo } from 'react'
import { useFixedExpenses } from '../modules/fixed-expenses/hooks/useFixedExpenses'
import { FixedExpense } from '../types'

export interface UpcomingExpense extends FixedExpense {
  daysUntilDue: number
}

export function useUpcomingFixedExpenses(withinDays = 7) {
  const { data: expenses = [] } = useFixedExpenses()

  return useMemo(() => {
    const today = new Date()
    const todayDay = today.getDate()
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

    return expenses
      .filter((e) => e.day_of_month !== null)
      .map((e) => {
        const due = e.day_of_month!
        // Days until due this month (or next if already passed)
        let daysUntil = due - todayDay
        if (daysUntil < 0) daysUntil += daysInMonth
        return { ...e, daysUntilDue: daysUntil }
      })
      .filter((e) => e.daysUntilDue <= withinDays)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
  }, [expenses, withinDays])
}
