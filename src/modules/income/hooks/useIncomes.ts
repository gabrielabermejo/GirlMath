import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { useFilters } from '../../../context/FiltersContext'
import { Income } from '../../../types'

export function useIncomes() {
  const { user } = useAuth()
  const { filters } = useFilters()

  const query = useQuery<Income[]>({
    queryKey: ['incomes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
      if (error) throw error
      return data as Income[]
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const filtered = useMemo(() => {
    const data = query.data ?? []
    return data
      .filter((i) => {
        const d = new Date(i.date + 'T00:00:00')
        return d.getMonth() === filters.month && d.getFullYear() === filters.year
      })
      .sort((a, b) => {
        const dir = filters.sortDir === 'asc' ? 1 : -1
        if (filters.sortBy === 'amount') return (a.amount - b.amount) * dir
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir
      })
  }, [query.data, filters])

  const total = useMemo(
    () => filtered.reduce((sum, i) => sum + i.amount, 0),
    [filtered],
  )

  return { ...query, filtered, total }
}
