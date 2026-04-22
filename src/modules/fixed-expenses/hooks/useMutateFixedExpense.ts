import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import toast from 'react-hot-toast'
import { ExpenseCategory } from '../../../types'

interface FixedExpensePayload {
  amount: number
  description: string
  category: ExpenseCategory
  day_of_month: number | null
}

export function useCreateFixedExpense() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: FixedExpensePayload) => {
      const { error } = await supabase
        .from('fixed_expenses')
        .insert({ ...payload, user_id: user!.id })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fixed_expenses', user?.id] })
      toast.success('Gasto fijo registrado')
    },
    onError: () => toast.error('Error al registrar gasto fijo'),
  })
}

export function useUpdateFixedExpense() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: FixedExpensePayload & { id: string }) => {
      const { error } = await supabase
        .from('fixed_expenses')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fixed_expenses', user?.id] })
      toast.success('Gasto fijo actualizado')
    },
    onError: () => toast.error('Error al actualizar gasto fijo'),
  })
}

export function useDeleteFixedExpense() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('fixed_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fixed_expenses', user?.id] })
      toast.success('Gasto fijo eliminado')
    },
    onError: () => toast.error('Error al eliminar gasto fijo'),
  })
}
