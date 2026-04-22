import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Expense, EXPENSE_CATEGORIES, CATEGORY_LABELS, ExpenseCategory } from '../../../types'
import { useCreateExpense, useUpdateExpense } from '../hooks/useMutateExpense'

const schema = z.object({
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  date: z.string().min(1, 'La fecha es requerida'),
  description: z.string().min(1, 'La descripción es requerida'),
  category: z.enum(EXPENSE_CATEGORIES, { errorMap: () => ({ message: 'Selecciona una categoría' }) }),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initial?: Expense
  onClose: () => void
}

export default function ExpenseForm({ initial, onClose }: Props) {
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

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
      category: (initial?.category as ExpenseCategory) ?? 'other',
    },
  })

  async function onSubmit(values: FormValues) {
    if (initial) {
      await updateExpense.mutateAsync({ id: initial.id, ...values })
    } else {
      await createExpense.mutateAsync(values)
    }
    onClose()
  }

  const isLoading = createExpense.isPending || updateExpense.isPending

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
          placeholder="Ej: Almuerzo en restaurante"
          {...register('description')}
        />
        {errors.description && <p className="error-msg">{errors.description.message}</p>}
      </div>

      <div>
        <label className="label">Categoría</label>
        <select className="input" {...register('category')}>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        {errors.category && <p className="error-msg">{errors.category.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Guardando...' : initial ? 'Guardar cambios' : 'Registrar gasto'}
        </button>
      </div>
    </form>
  )
}
