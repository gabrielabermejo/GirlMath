import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { useFilters } from '../../../context/FiltersContext'
import { Expense, CATEGORY_LABELS, CATEGORY_COLORS, ExpenseCategory, CategoryTotal } from '../../../types'

export function useExpenses() {
  const { user } = useAuth()
  const { filters } = useFilters()

  const query = useQuery<Expense[]>({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
      if (error) throw error
      return data as Expense[]
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const filtered = useMemo(() => {
    const data = query.data ?? []
    return data
      .filter((e) => {
        const d = new Date(e.date + 'T00:00:00')
        const matchMonth = d.getMonth() === filters.month && d.getFullYear() === filters.year
        const matchCat =
          filters.expenseCategory === 'all' || e.category === filters.expenseCategory
        return matchMonth && matchCat
      })
      .sort((a, b) => {
        const dir = filters.sortDir === 'asc' ? 1 : -1
        if (filters.sortBy === 'amount') return (a.amount - b.amount) * dir
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir
      })
  }, [query.data, filters])

  const total = useMemo(
    () => filtered.reduce((sum, e) => sum + e.amount, 0),
    [filtered],
  )

  const byCategory = useMemo((): CategoryTotal[] => {
    const map: Partial<Record<ExpenseCategory, number>> = {}
    filtered.forEach((e) => {
      map[e.category] = (map[e.category] ?? 0) + e.amount
    })
    return (Object.entries(map) as [ExpenseCategory, number][])
      .map(([cat, t]) => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        total: t,
        color: CATEGORY_COLORS[cat],
      }))
      .sort((a, b) => b.total - a.total)
  }, [filtered])

  return { ...query, filtered, total, byCategory }
}
