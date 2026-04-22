import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import toast from 'react-hot-toast'
import { ExpenseCategory } from '../../../types'

interface ExpensePayload {
  amount: number
  date: string
  description: string
  category: ExpenseCategory
}

export function useCreateExpense() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ExpensePayload) => {
      const { error } = await supabase
        .from('expenses')
        .insert({ ...payload, user_id: user!.id })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', user?.id] })
      toast.success('Gasto registrado')
    },
    onError: () => toast.error('Error al registrar gasto'),
  })
}

export function useUpdateExpense() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: ExpensePayload & { id: string }) => {
      const { error } = await supabase
        .from('expenses')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', user?.id] })
      toast.success('Gasto actualizado')
    },
    onError: () => toast.error('Error al actualizar gasto'),
  })
}

export function useDeleteExpense() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', user?.id] })
      toast.success('Gasto eliminado')
    },
    onError: () => toast.error('Error al eliminar gasto'),
  })
}
