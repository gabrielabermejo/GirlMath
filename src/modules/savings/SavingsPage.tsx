import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Trash2, PiggyBank, TrendingUp, CalendarDays } from 'lucide-react'
import SwipeableRow, { SwipeAction } from '../../components/ui/SwipeableRow'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatCard from '../../components/ui/StatCard'
import SavingsForm from './components/SavingsForm'
import { useSavings } from './hooks/useSavings'
import { useDeleteSaving } from './hooks/useMutateSavings'
import { Saving } from '../../types'
import { formatCurrency } from '../../lib/utils'

export default function SavingsPage() {
  const { data: records, total, isLoading } = useSavings()
  const deleteSaving = useDeleteSaving()

  const [modalOpen, setModalOpen] = useState(false)
  const [deleting, setDeleting] = useState<Saving | null>(null)

  async function confirmDelete() {
    if (!deleting) return
    await deleteSaving.mutateAsync(deleting.id)
    setDeleting(null)
  }

  const thisMonth = new Date()
  const savedThisMonth = records
    .filter((r) => {
      const d = new Date(r.date + 'T00:00:00')
      return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear()
    })
    .reduce((s, r) => s + r.amount, 0)

  return (
    <div>
      <Header title="Ahorros" subtitle="Tu dinero guardado" />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total acumulado"
            value={formatCurrency(total)}
            subtext={`${records.length} registro${records.length !== 1 ? 's' : ''}`}
            icon={<PiggyBank size={18} className="text-pink-500" />}
            variant="income"
          />
          <StatCard
            label="Este mes"
            value={formatCurrency(savedThisMonth)}
            subtext="Ahorrado en el mes actual"
            icon={<TrendingUp size={18} className="text-emerald-500" />}
            variant="income"
          />
          <StatCard
            label="Promedio mensual"
            value={formatCurrency(records.length ? total / Math.max(1, new Set(records.map((r) => r.date.slice(0, 7))).size) : 0)}
            subtext="Por mes con registros"
            icon={<CalendarDays size={18} className="text-violet-400" />}
            variant="default"
          />
        </div>

        {/* Info banner */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Cada vez que apartas dinero, regístralo aquí. Se descuenta del disponible mensual en el dashboard para que sepas exactamente cuánto puedes gastar.
        </div>

        {/* Toolbar */}
        <div className="flex justify-end">
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Apartar ahorro
          </button>
        </div>

        {/* Mobile swipeable list */}
        <div className="md:hidden card overflow-hidden">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
              <PiggyBank size={32} />
              <p className="text-sm">Aún no has guardado ahorros</p>
              <p className="text-xs">¡Empieza hoy! 🐷</p>
            </div>
          ) : (
            <div className="divide-y divide-pink-50">
              {records.map((record) => (
                <SwipeableRow
                  key={record.id}
                  actions={[
                    { icon: <Trash2 size={15} color="white" />, label: 'Eliminar', color: '#a78bfa', onClick: () => setDeleting(record) },
                  ] satisfies SwipeAction[]}
                >
                  <div className="flex items-center justify-between gap-3 px-4 py-3.5 bg-white">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <PiggyBank size={12} className="shrink-0 text-pink-400" />
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {record.description ?? 'Ahorro'}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {format(new Date(record.date + 'T00:00:00'), 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 shrink-0">
                      {formatCurrency(record.amount)}
                    </span>
                  </div>
                </SwipeableRow>
              ))}
              {/* Total footer */}
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t-2 border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Total acumulado</span>
                <span className="text-sm font-bold text-emerald-600">{formatCurrency(total)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block card overflow-hidden">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
              <PiggyBank size={32} />
              <p className="text-sm">Aún no has guardado ahorros</p>
              <p className="text-xs">¡Empieza hoy! 🐷</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead className="border-b border-pink-50 bg-pink-50/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Descripción</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Monto</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-pink-50/30">
                      <td className="px-4 py-3 text-gray-600">
                        {format(new Date(record.date + 'T00:00:00'), 'dd MMM yyyy', { locale: es })}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {record.description ?? <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                        {formatCurrency(record.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDeleting(record)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700">Total acumulado</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">{formatCurrency(total)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Apartar ahorro">
        <SavingsForm onClose={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Eliminar registro"
        description={`¿Quieres eliminar este ahorro de ${deleting ? formatCurrency(deleting.amount) : ''}? El monto volverá a aparecer como disponible.`}
        isLoading={deleteSaving.isPending}
      />
    </div>
  )
}
