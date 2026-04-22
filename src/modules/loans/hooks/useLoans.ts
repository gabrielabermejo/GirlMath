import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { Loan } from '../../../types'

export function useLoans() {
  const { user } = useAuth()

  return useQuery<Loan[]>({
    queryKey: ['loans', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', user!.id)
        .order('lent_date', { ascending: false })
      if (error) throw error
      return data as Loan[]
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}
