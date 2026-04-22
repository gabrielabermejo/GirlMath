import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { FixedExpense } from '../../../types'

export function useFixedExpenses() {
  const { user } = useAuth()

  const query = useQuery<FixedExpense[]>({
    queryKey: ['fixed_expenses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixed_expenses')
        .select('*')
        .eq('user_id', user!.id)
        .order('description', { ascending: true })
      if (error) throw error
      return data as FixedExpense[]
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const total = useMemo(
    () => (query.data ?? []).reduce((s, e) => s + e.amount, 0),
    [query.data],
  )

  return { ...query, total }
}
