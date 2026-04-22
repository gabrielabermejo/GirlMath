import { useState } from 'react'
import { Plus, Pencil, Trash2, RepeatIcon, CalendarDays } from 'lucide-react'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatCard from '../../components/ui/StatCard'
import FixedExpenseForm from './components/FixedExpenseForm'
import { useFixedExpenses } from './hooks/useFixedExpenses'
import { useDeleteFixedExpense } from './hooks/useMutateFixedExpense'
import { FixedExpense, CATEGORY_LABELS, CATEGORY_COLORS } from '../../types'
import { formatCurrency } from '../../lib/utils'

export default function FixedExpensesPage() {
  const { data: expenses = [], total, isLoading } = useFixedExpenses()
  const deleteFixed = useDeleteFixedExpense()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FixedExpense | null>(null)
  const [deleting, setDeleting] = useState<FixedExpense | null>(null)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(e: FixedExpense) {
    setEditing(e)
    setModalOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    await deleteFixed.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div>
      <Header
        title="Gastos fijos"
        subtitle="Se descuentan automáticamente cada mes"
      />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            label="Total mensual fijo"
            value={formatCurrency(total)}
            subtext={`${expenses.length} gasto${expenses.length !== 1 ? 's' : ''} recurrente${expenses.length !== 1 ? 's' : ''}`}
            icon={<RepeatIcon size={18} className="text-violet-600" />}
            variant="default"
          />
          <StatCard
            label="Total anual estimado"
            value={formatCurrency(total * 12)}
            subtext="Proyección a 12 meses"
            icon={<CalendarDays size={18} className="text-gray-500" />}
            variant="default"
          />
        </div>

        {/* Info banner */}
        <div className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700">
          Los gastos fijos se suman automáticamente al total de gastos de cada mes en el dashboard.
          No necesitas registrarlos manualmente cada mes.
        </div>

        {/* Toolbar */}
        <div className="flex justify-end">
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Agregar gasto fijo
          </button>
        </div>

        {/* List */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
              <RepeatIcon size={32} />
              <p className="text-sm">No hay gastos fijos registrados</p>
              <p className="text-xs">Agrega tu plan de teléfono, suscripciones, etc.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="border-b border-pink-50 bg-pink-50/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Descripción</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Categoría</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Día de cobro</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Monto/mes</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-pink-50/30">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <RepeatIcon size={13} className="shrink-0 text-violet-400" />
                        {expense.description}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: CATEGORY_COLORS[expense.category] + '20',
                          color: CATEGORY_COLORS[expense.category],
                        }}
                      >
                        {CATEGORY_LABELS[expense.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {expense.day_of_month ? `Día ${expense.day_of_month}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-violet-700">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(expense)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleting(expense)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Total mensual
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-violet-700">
                    {formatCurrency(total)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar gasto fijo' : 'Nuevo gasto fijo'}
      >
        <FixedExpenseForm
          initial={editing ?? undefined}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Eliminar gasto fijo"
        description={`¿Seguro que quieres eliminar "${deleting?.description}"? Dejará de contarse en los meses futuros.`}
        isLoading={deleteFixed.isPending}
      />
    </div>
  )
}
