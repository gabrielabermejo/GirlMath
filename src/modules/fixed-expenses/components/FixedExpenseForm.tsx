import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FixedExpense, EXPENSE_CATEGORIES, CATEGORY_LABELS, ExpenseCategory } from '../../../types'
import { useCreateFixedExpense, useUpdateFixedExpense } from '../hooks/useMutateFixedExpense'

const schema = z.object({
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  description: z.string().min(1, 'La descripción es requerida'),
  category: z.enum(EXPENSE_CATEGORIES, {
    errorMap: () => ({ message: 'Selecciona una categoría' }),
  }),
  day_of_month: z.coerce
    .number()
    .int()
    .min(1)
    .max(31)
    .nullable()
    .optional()
    .transform((v) => v ?? null),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initial?: FixedExpense
  onClose: () => void
}

export default function FixedExpenseForm({ initial, onClose }: Props) {
  const create = useCreateFixedExpense()
  const update = useUpdateFixedExpense()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: initial?.amount ?? undefined,
      description: initial?.description ?? '',
      category: (initial?.category as ExpenseCategory) ?? 'other',
      day_of_month: initial?.day_of_month ?? undefined,
    },
  })

  async function onSubmit(values: FormValues) {
    const payload = {
      amount: values.amount,
      description: values.description,
      category: values.category,
      day_of_month: values.day_of_month ?? null,
    }
    if (initial) {
      await update.mutateAsync({ id: initial.id, ...payload })
    } else {
      await create.mutateAsync(payload)
    }
    onClose()
  }

  const isLoading = create.isPending || update.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Descripción</label>
        <input
          className="input"
          placeholder="Ej: Plan de telefonía, Netflix, Gym…"
          {...register('description')}
        />
        {errors.description && <p className="error-msg">{errors.description.message}</p>}
      </div>

      <div>
        <label className="label">Monto mensual</label>
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

      <div>
        <label className="label">Día de cobro (opcional)</label>
        <input
          type="number"
          min="1"
          max="31"
          className="input"
          placeholder="Ej: 5 (día 5 de cada mes)"
          {...register('day_of_month')}
        />
        <p className="mt-1 text-xs text-gray-400">Deja vacío si el día varía</p>
        {errors.day_of_month && (
          <p className="error-msg">{errors.day_of_month.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Guardando...' : initial ? 'Guardar cambios' : 'Agregar gasto fijo'}
        </button>
      </div>
    </form>
  )
}
