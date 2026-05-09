import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateSaving } from '../hooks/useMutateSavings'

const schema = z.object({
  amount:      z.number({ invalid_type_error: 'Ingresa un monto' }).positive('Debe ser mayor a 0'),
  date:        z.string().min(1, 'La fecha es obligatoria'),
  description: z.string().nullable().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onClose: () => void
}

export default function SavingsForm({ onClose }: Props) {
  const createSaving = useCreateSaving()

  const today = new Date().toISOString().split('T')[0]

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { date: today, description: null },
  })

  async function onSubmit(values: FormValues) {
    await createSaving.mutateAsync({
      amount: values.amount,
      date: values.date,
      description: values.description ?? null,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Amount */}
      <div>
        <label className="label">Monto ahorrado</label>
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

      {/* Date */}
      <div>
        <label className="label">Fecha</label>
        <input type="date" className="input" {...register('date')} />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="label">Descripción <span className="text-gray-400 font-normal">(opcional)</span></label>
        <input
          type="text"
          placeholder="Ej. Ahorro de enero, fondo de emergencia…"
          className="input"
          {...register('description')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={createSaving.isPending}>
          {createSaving.isPending ? 'Guardando…' : 'Guardar ahorro'}
        </button>
      </div>
    </form>
  )
}
