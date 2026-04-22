import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import toast from 'react-hot-toast'

interface LoanPayload {
  person_name: string
  amount: number
  lent_date: string
  notes: string | null
}

export function useCreateLoan() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: LoanPayload) => {
      const { error } = await supabase
        .from('loans')
        .insert({ ...payload, user_id: user!.id, status: 'pending' })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans', user?.id] })
      toast.success('Préstamo registrado')
    },
    onError: () => toast.error('Error al registrar préstamo'),
  })
}

export function useMarkLoanPaid() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, amount, person_name }: { id: string; amount: number; person_name: string }) => {
      const today = new Date().toISOString().split('T')[0]

      const { error: loanError } = await supabase
        .from('loans')
        .update({ status: 'paid', paid_date: today })
        .eq('id', id)
        .eq('user_id', user!.id)
      if (loanError) throw loanError

      // Registrar el pago como ingreso para que se contabilice en el ahorro
      const { error: incomeError } = await supabase
        .from('incomes')
        .insert({
          user_id: user!.id,
          amount,
          date: today,
          description: `Pago de préstamo — ${person_name}`,
          category: 'préstamo',
        })
      if (incomeError) throw incomeError
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans', user?.id] })
      qc.invalidateQueries({ queryKey: ['incomes', user?.id] })
      toast.success('¡Pagado! El monto fue agregado a tus ingresos 💰')
    },
    onError: () => toast.error('Error al marcar como pagado'),
  })
}

export function useDeleteLoan() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans', user?.id] })
      toast.success('Préstamo eliminado')
    },
    onError: () => toast.error('Error al eliminar préstamo'),
  })
}
