import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import toast from 'react-hot-toast'
import { Income } from '../../../types'

interface IncomePayload {
  amount: number
  date: string
  description: string
  category: string | null
}

export function useCreateIncome() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: IncomePayload) => {
      const { error } = await supabase
        .from('incomes')
        .insert({ ...payload, user_id: user!.id })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes', user?.id] })
      toast.success('Ingreso registrado')
    },
    onError: () => toast.error('Error al registrar ingreso'),
  })
}

export function useUpdateIncome() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: IncomePayload & { id: string }) => {
      const { error } = await supabase
        .from('incomes')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes', user?.id] })
      toast.success('Ingreso actualizado')
    },
    onError: () => toast.error('Error al actualizar ingreso'),
  })
}

export function useDeleteIncome() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['incomes', user?.id] })
      toast.success('Ingreso eliminado')
    },
    onError: () => toast.error('Error al eliminar ingreso'),
  })
}

export type { Income }
