import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateLoan } from '../hooks/useMutateLoans'

const schema = z.object({
  person_name: z.string().min(1, 'El nombre es requerido'),
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  lent_date: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onClose: () => void
}

export default function LoanForm({ onClose }: Props) {
  const createLoan = useCreateLoan()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      lent_date: new Date().toISOString().slice(0, 10),
    },
  })

  async function onSubmit(values: FormValues) {
    await createLoan.mutateAsync({
      person_name: values.person_name,
      amount: values.amount,
      lent_date: values.lent_date,
      notes: values.notes || null,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Nombre de la persona</label>
        <input
          className="input"
          placeholder="Ej: María García"
          {...register('person_name')}
        />
        {errors.person_name && <p className="error-msg">{errors.person_name.message}</p>}
      </div>

      <div>
        <label className="label">Cantidad prestada</label>
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
        <label className="label">Fecha del préstamo</label>
        <input type="date" className="input" {...register('lent_date')} />
        {errors.lent_date && <p className="error-msg">{errors.lent_date.message}</p>}
      </div>

      <div>
        <label className="label">Notas (opcional)</label>
        <input
          className="input"
          placeholder="Ej: Para gastos médicos"
          {...register('notes')}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={createLoan.isPending}>
          {createLoan.isPending ? 'Guardando...' : 'Registrar préstamo'}
        </button>
      </div>
    </form>
  )
}
