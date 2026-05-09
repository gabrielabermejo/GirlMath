import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateDebt, useUpdateDebt } from '../hooks/useMutateDebts'
import { Debt } from '../../../types'

const schema = z.object({
  creditor_name: z.string().min(1, 'Ingresa a quién le debes'),
  amount:        z.number({ invalid_type_error: 'Ingresa un monto' }).positive('Debe ser mayor a 0'),
  due_date:      z.string().nullable().optional(),
  description:   z.string().nullable().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initial?: Debt
  onClose: () => void
}

export default function DebtForm({ initial, onClose }: Props) {
  const createDebt = useCreateDebt()
  const updateDebt = useUpdateDebt()
  const isEditing = !!initial

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? { creditor_name: initial.creditor_name, amount: initial.amount, due_date: initial.due_date ?? '', description: initial.description ?? '' }
      : { due_date: '', description: '' },
  })

  async function onSubmit(values: FormValues) {
    const payload = {
      creditor_name: values.creditor_name,
      amount:        values.amount,
      due_date:      values.due_date || null,
      description:   values.description || null,
    }
    if (isEditing) {
      await updateDebt.mutateAsync({ id: initial!.id, ...payload })
    } else {
      await createDebt.mutateAsync(payload)
    }
    onClose()
  }

  const isPending = createDebt.isPending || updateDebt.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">¿A quién le debes?</label>
        <input
          type="text"
          placeholder="Banco, amigo, tarjeta de crédito…"
          className="input"
          {...register('creditor_name')}
        />
        {errors.creditor_name && <p className="mt-1 text-xs text-red-500">{errors.creditor_name.message}</p>}
      </div>

      <div>
        <label className="label">Monto</label>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="0"
          className="input"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="label">Fecha límite <span className="text-gray-400 font-normal">(opcional)</span></label>
        <input type="date" className="input" {...register('due_date')} />
      </div>

      <div>
        <label className="label">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
        <input
          type="text"
          placeholder="Ej. Cuota 3/12, tarjeta de crédito, préstamo…"
          className="input"
          {...register('description')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={isPending}>
          {isPending ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Registrar deuda'}
        </button>
      </div>
    </form>
  )
}
