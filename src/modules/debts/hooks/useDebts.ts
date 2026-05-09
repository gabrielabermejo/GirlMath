import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { Debt } from '../../../types'

export function useDebts() {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: ['debts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('user_id', user!.id)
        .order('due_date', { ascending: true, nullsFirst: false })
      if (error) throw error
      return data as Debt[]
    },
    enabled: !!user,
  })

  return { ...query, data: query.data ?? [] }
}
