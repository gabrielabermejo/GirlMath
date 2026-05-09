import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { toast } from '../../../lib/toast'

interface SavingPayload {
  amount: number
  date: string
  description: string | null
}

export function useCreateSaving() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (payload: SavingPayload) => {
      const { error } = await supabase
        .from('savings')
        .insert({ ...payload, user_id: user!.id })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings', user?.id] })
      toast.success('¡Ahorro guardado! 🐷')
    },
    onError: () => toast.error('Error al guardar ahorro'),
  })
}

export function useDeleteSaving() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('savings')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings', user?.id] })
      toast.success('Registro de ahorro eliminado')
    },
    onError: () => toast.error('Error al eliminar ahorro'),
  })
}
