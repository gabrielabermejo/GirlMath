import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BankAccount } from '../../../types'
import { useCreateBankAccount, useUpdateBankAccount } from '../hooks/useMutateBankAccount'

const COLORS = [
  { value: '#f9a8d4', label: 'Rosa' },
  { value: '#c4b5fd', label: 'Lila' },
  { value: '#93c5fd', label: 'Azul' },
  { value: '#86efac', label: 'Verde' },
  { value: '#fde047', label: 'Amarillo' },
  { value: '#fb923c', label: 'Naranja' },
]

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  bank: z.string().min(1, 'El banco es requerido'),
  color: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initial?: BankAccount
  onClose: () => void
}

export default function BankAccountForm({ initial, onClose }: Props) {
  const create = useCreateBankAccount()
  const update = useUpdateBankAccount()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      bank: initial?.bank ?? '',
      color: initial?.color ?? '#f9a8d4',
    },
  })

  const selectedColor = watch('color')

  async function onSubmit(values: FormValues) {
    if (initial) {
      await update.mutateAsync({ id: initial.id, ...values })
    } else {
      await create.mutateAsync(values)
    }
    onClose()
  }

  const isLoading = create.isPending || update.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Nombre de la cuenta</label>
        <input className="input" placeholder="Ej: Cuenta nómina, Ahorros..." {...register('name')} />
        {errors.name && <p className="error-msg">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label">Banco</label>
        <input className="input" placeholder="Ej: Bancolombia, Nequi, Daviplata..." {...register('bank')} />
        {errors.bank && <p className="error-msg">{errors.bank.message}</p>}
      </div>

      <div>
        <label className="label">Color</label>
        <div className="flex gap-2 flex-wrap mt-1">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setValue('color', c.value)}
              className="w-8 h-8 rounded-full border-2 transition"
              style={{
                backgroundColor: c.value,
                borderColor: selectedColor === c.value ? '#ec4899' : 'transparent',
                transform: selectedColor === c.value ? 'scale(1.2)' : 'scale(1)',
              }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Guardando...' : initial ? 'Guardar cambios' : 'Agregar cuenta'}
        </button>
      </div>
    </form>
  )
}
