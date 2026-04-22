import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Trash2, CheckCircle2, Clock, Banknote, HandCoins } from 'lucide-react'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatCard from '../../components/ui/StatCard'
import LoanForm from './components/LoanForm'
import { useLoans } from './hooks/useLoans'
import { useMarkLoanPaid, useDeleteLoan } from './hooks/useMutateLoans'
import { Loan } from '../../types'
import { formatCurrency } from '../../lib/utils'

export default function LoansPage() {
  const { data: loans = [], isLoading } = useLoans()
  const markPaid = useMarkLoanPaid()
  const deleteLoan = useDeleteLoan()

  const [modalOpen, setModalOpen] = useState(false)
  const [deleting, setDeleting] = useState<Loan | null>(null)
  const [confirming, setConfirming] = useState<Loan | null>(null)

  const pending = loans.filter((l) => l.status === 'pending')
  const paid    = loans.filter((l) => l.status === 'paid')
  const totalPending = pending.reduce((s, l) => s + l.amount, 0)
  const totalPaid    = paid.reduce((s, l) => s + l.amount, 0)

  async function confirmPaid() {
    if (!confirming) return
    await markPaid.mutateAsync({ id: confirming.id, amount: confirming.amount, person_name: confirming.person_name })
    setConfirming(null)
  }

  async function confirmDelete() {
    if (!deleting) return
    await deleteLoan.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div>
      <Header title="Préstamos" subtitle="Personas que te deben dinero" />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Por cobrar"
            value={formatCurrency(totalPending)}
            subtext={`${pending.length} préstamo${pending.length !== 1 ? 's' : ''} pendiente${pending.length !== 1 ? 's' : ''}`}
            icon={<Clock size={18} className="text-amber-500" />}
            variant="expense"
          />
          <StatCard
            label="Ya cobrado"
            value={formatCurrency(totalPaid)}
            subtext={`${paid.length} préstamo${paid.length !== 1 ? 's' : ''} pagado${paid.length !== 1 ? 's' : ''}`}
            icon={<CheckCircle2 size={18} className="text-emerald-500" />}
            variant="income"
          />
          <StatCard
            label="Total prestado"
            value={formatCurrency(totalPending + totalPaid)}
            subtext="histórico"
            icon={<HandCoins size={18} className="text-pink-500" />}
            variant="default"
          />
        </div>

        {/* Toolbar */}
        <div className="flex justify-end">
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Nuevo préstamo
          </button>
        </div>

        {/* Pending */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Pendientes</h2>
          <div className="card overflow-hidden">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
              </div>
            ) : pending.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-gray-400">
                <Banknote size={28} />
                <p className="text-sm">Nadie te debe dinero 🎉</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[520px]">
                  <thead className="border-b border-pink-50 bg-pink-50/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Persona</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Fecha préstamo</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Notas</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Monto</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {pending.map((loan) => (
                      <tr key={loan.id} className="hover:bg-pink-50/30">
                        <td className="px-4 py-3 font-medium text-gray-900">{loan.person_name}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {format(new Date(loan.lent_date + 'T00:00:00'), 'dd MMM yyyy', { locale: es })}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{loan.notes ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-amber-500">
                          {formatCurrency(loan.amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setConfirming(loan)}
                              title="Marcar como pagado"
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500 transition"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                            <button
                              onClick={() => setDeleting(loan)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-400 transition"
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

        {/* Paid */}
        {paid.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Pagados</h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[520px]">
                  <thead className="border-b border-pink-50 bg-pink-50/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Persona</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Prestado</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Pagado</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Notas</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Monto</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {paid.map((loan) => (
                      <tr key={loan.id} className="hover:bg-pink-50/30 opacity-70">
                        <td className="px-4 py-3 font-medium text-gray-700">{loan.person_name}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {format(new Date(loan.lent_date + 'T00:00:00'), 'dd MMM yyyy', { locale: es })}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {loan.paid_date
                            ? format(new Date(loan.paid_date + 'T00:00:00'), 'dd MMM yyyy', { locale: es })
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{loan.notes ?? '—'}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-500">
                          {formatCurrency(loan.amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setDeleting(loan)}
                            className="rounded-lg p-1.5 text-gray-300 hover:bg-violet-50 hover:text-violet-400 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo préstamo">
        <LoanForm onClose={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={confirmPaid}
        title="¿Ya te pagó?"
        description={`¿Confirmas que ${confirming?.person_name} te pagó ${confirming ? formatCurrency(confirming.amount) : ''}? Este monto se agregará automáticamente a tus ingresos.`}
        isLoading={markPaid.isPending}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Eliminar préstamo"
        description={`¿Seguro que quieres eliminar el préstamo de ${deleting?.person_name}?`}
        isLoading={deleteLoan.isPending}
      />
    </div>
  )
}
