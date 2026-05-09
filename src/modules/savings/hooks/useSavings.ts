import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { Saving } from '../../../types'

export function useSavings() {
  const { user } = useAuth()

  const query = useQuery({
    queryKey: ['savings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
      if (error) throw error
      return data as Saving[]
    },
    enabled: !!user,
  })

  const total = query.data?.reduce((s, r) => s + r.amount, 0) ?? 0

  return { ...query, data: query.data ?? [], total }
}
