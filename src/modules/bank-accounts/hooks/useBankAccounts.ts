import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { BankAccount } from '../../../types'

export function useBankAccounts() {
  const { user } = useAuth()

  return useQuery<BankAccount[]>({
    queryKey: ['bank_accounts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as BankAccount[]
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  })
}
