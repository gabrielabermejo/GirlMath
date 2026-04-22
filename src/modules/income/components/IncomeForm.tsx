import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Income } from '../../../types'
import { useCreateIncome, useUpdateIncome } from '../hooks/useMutateIncome'

const schema = z.object({
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  date: z.string().min(1, 'La fecha es requerida'),
  description: z.string().min(1, 'La descripción es requerida'),
  category: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initial?: Income
  onClose: () => void
}

export default function IncomeForm({ initial, onClose }: Props) {
  const createIncome = useCreateIncome()
  const updateIncome = useUpdateIncome()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: initial?.amount ?? undefined,
      date: initial?.date ?? new Date().toISOString().slice(0, 10),
      description: initial?.description ?? '',
      category: initial?.category ?? '',
    },
  })

  async function onSubmit(values: FormValues) {
    const payload = {
      amount: values.amount,
      date: values.date,
      description: values.description,
      category: values.category || null,
    }

    if (initial) {
      await updateIncome.mutateAsync({ id: initial.id, ...payload })
    } else {
      await createIncome.mutateAsync(payload)
    }
    onClose()
  }

  const isLoading = createIncome.isPending || updateIncome.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Monto</label>
        <input
          type="number"
          step="0.01"
          min="0"
          className="input"
          placeholder="0.00"
          {...register('amount')}
        />
        {errors.amount && <p className="error-msg">{errors.amount.message}</p>}
      </div>

      <div>
        <label className="label">Fecha</label>
        <input type="date" className="input" {...register('date')} />
        {errors.date && <p className="error-msg">{errors.date.message}</p>}
      </div>

      <div>
        <label className="label">Descripción</label>
        <input
          className="input"
          placeholder="Ej: Salario mensual"
          {...register('description')}
        />
        {errors.description && <p className="error-msg">{errors.description.message}</p>}
      </div>

      <div>
        <label className="label">Categoría (opcional)</label>
        <input
          className="input"
          placeholder="Ej: Salario, Freelance, Inversión…"
          {...register('category')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Guardando...' : initial ? 'Guardar cambios' : 'Registrar ingreso'}
        </button>
      </div>
    </form>
  )
}
