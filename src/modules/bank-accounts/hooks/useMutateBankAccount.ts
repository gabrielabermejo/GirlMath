import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import toast from 'react-hot-toast'

interface BankAccountPayload {
  name: string
  bank: string
  color: string
}

export function useCreateBankAccount() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: BankAccountPayload) => {
      const { error } = await supabase
        .from('bank_accounts')
        .insert({ ...payload, user_id: user!.id })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bank_accounts', user?.id] })
      toast.success('Cuenta registrada')
    },
    onError: () => toast.error('Error al registrar cuenta'),
  })
}

export function useUpdateBankAccount() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...payload }: BankAccountPayload & { id: string }) => {
      const { error } = await supabase
        .from('bank_accounts')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bank_accounts', user?.id] })
      toast.success('Cuenta actualizada')
    },
    onError: () => toast.error('Error al actualizar cuenta'),
  })
}

export function useDeleteBankAccount() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bank_accounts', user?.id] })
      toast.success('Cuenta eliminada')
    },
    onError: () => toast.error('Error al eliminar cuenta'),
  })
}
