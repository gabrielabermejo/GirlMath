import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Pencil, Trash2, TrendingUp, ArrowUpDown } from 'lucide-react'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatCard from '../../components/ui/StatCard'
import IncomeForm from './components/IncomeForm'
import { useIncomes } from './hooks/useIncomes'
import { useDeleteIncome } from './hooks/useMutateIncome'
import { useFilters } from '../../context/FiltersContext'
import { Income } from '../../types'
import { MONTHS, formatCurrency } from '../../lib/utils'

export default function IncomePage() {
  const { filters, setMonth, setYear, setSortBy, setSortDir } = useFilters()
  const { filtered, total, isLoading } = useIncomes()
  const deleteIncome = useDeleteIncome()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Income | null>(null)
  const [deleting, setDeleting] = useState<Income | null>(null)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(income: Income) {
    setEditing(income)
    setModalOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    await deleteIncome.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div>
      <Header
        title="Ingresos"
        subtitle={`${MONTHS[filters.month]} ${filters.year}`}
      />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            label="Total ingresos del mes"
            value={formatCurrency(total)}
            subtext={`${filtered.length} registro${filtered.length !== 1 ? 's' : ''}`}
            icon={<TrendingUp size={18} className="text-emerald-600" />}
            variant="income"
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <select
              className="input w-auto"
              value={filters.month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select
              className="input w-auto"
              value={filters.year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2023, 2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              className="input w-auto"
              value={`${filters.sortBy}-${filters.sortDir}`}
              onChange={(e) => {
                const [by, dir] = e.target.value.split('-') as ['date' | 'amount', 'asc' | 'desc']
                setSortBy(by)
                setSortDir(dir)
              }}
            >
              <option value="date-desc">Fecha (reciente)</option>
              <option value="date-asc">Fecha (antigua)</option>
              <option value="amount-desc">Monto (mayor)</option>
              <option value="amount-asc">Monto (menor)</option>
            </select>
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Nuevo ingreso
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
              <ArrowUpDown size={32} />
              <p className="text-sm">No hay ingresos en este período</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead className="border-b border-pink-50 bg-pink-50/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Fecha</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Descripción</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Categoría</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Monto</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filtered.map((income) => (
                  <tr key={income.id} className="hover:bg-pink-50/30">
                    <td className="px-4 py-3 text-gray-600">
                      {format(new Date(income.date + 'T00:00:00'), 'dd MMM yyyy', { locale: es })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {income.description}
                    </td>
                    <td className="px-4 py-3">
                      {income.category ? (
                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          {income.category}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      {formatCurrency(income.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEdit(income)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleting(income)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar ingreso' : 'Nuevo ingreso'}
      >
        <IncomeForm
          initial={editing ?? undefined}
          onClose={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Eliminar ingreso"
        description={`¿Seguro que quieres eliminar "${deleting?.description}"? Esta acción no se puede deshacer.`}
        isLoading={deleteIncome.isPending}
      />
    </div>
  )
}
