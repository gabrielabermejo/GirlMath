import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { toast } from '../../../lib/toast'

interface DebtPayload {
  creditor_name: string
  amount: number
  due_date: string | null
  description: string | null
}

export function useCreateDebt() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: DebtPayload) => {
      const { error } = await supabase
        .from('debts')
        .insert({ ...payload, user_id: user!.id, status: 'pending' })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts', user?.id] })
      toast.success('Deuda registrada')
    },
    onError: () => toast.error('Error al registrar deuda'),
  })
}

export function useUpdateDebt() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: DebtPayload & { id: string }) => {
      const { error } = await supabase
        .from('debts')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts', user?.id] })
      toast.success('Deuda actualizada')
    },
    onError: () => toast.error('Error al actualizar deuda'),
  })
}

export function useMarkDebtPaid() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase
        .from('debts')
        .update({ status: 'paid', paid_date: today })
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts', user?.id] })
      toast.success('¡Deuda pagada! 🎉')
    },
    onError: () => toast.error('Error al marcar como pagada'),
  })
}

export function useDeleteDebt() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts', user?.id] })
      toast.success('Deuda eliminada')
    },
    onError: () => toast.error('Error al eliminar deuda'),
  })
}
