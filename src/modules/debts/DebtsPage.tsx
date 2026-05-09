import { useState } from 'react'
import { format, isPast, isThisMonth, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus, Pencil, Trash2, CheckCircle2, AlertCircle, CreditCard, Clock, Banknote } from 'lucide-react'
import SwipeableRow, { SwipeAction } from '../../components/ui/SwipeableRow'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StatCard from '../../components/ui/StatCard'
import DebtForm from './components/DebtForm'
import { useDebts } from './hooks/useDebts'
import { useMarkDebtPaid, useDeleteDebt } from './hooks/useMutateDebts'
import { Debt } from '../../types'
import { formatCurrency } from '../../lib/utils'

function isOverdue(debt: Debt) {
  return debt.due_date && debt.status === 'pending' && isPast(parseISO(debt.due_date + 'T23:59:59'))
}

function isDueThisMonth(debt: Debt) {
  return debt.due_date && debt.status === 'pending' && isThisMonth(parseISO(debt.due_date))
}

export default function DebtsPage() {
  const { data: debts, isLoading } = useDebts()
  const markPaid  = useMarkDebtPaid()
  const deleteDebt = useDeleteDebt()

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editing,     setEditing]     = useState<Debt | null>(null)
  const [confirming,  setConfirming]  = useState<Debt | null>(null)
  const [deleting,    setDeleting]    = useState<Debt | null>(null)

  const pending = debts.filter((d) => d.status === 'pending')
  const paid    = debts.filter((d) => d.status === 'paid')

  const totalPending  = pending.reduce((s, d) => s + d.amount, 0)
  const overdueCount  = pending.filter(isOverdue).length
  const thisMonthTotal = pending.filter(isDueThisMonth).reduce((s, d) => s + d.amount, 0)

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(d: Debt) { setEditing(d); setModalOpen(true) }

  async function confirmPaid() {
    if (!confirming) return
    await markPaid.mutateAsync(confirming.id)
    setConfirming(null)
  }

  async function confirmDelete() {
    if (!deleting) return
    await deleteDebt.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div>
      <Header title="Mis deudas" subtitle="Lo que le debes a otros" />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total por pagar"
            value={formatCurrency(totalPending)}
            subtext={`${pending.length} deuda${pending.length !== 1 ? 's' : ''} pendiente${pending.length !== 1 ? 's' : ''}`}
            icon={<CreditCard size={18} className="text-rose-500" />}
            variant="expense"
          />
          <StatCard
            label="Vencen este mes"
            value={formatCurrency(thisMonthTotal)}
            subtext={overdueCount > 0 ? `⚠️ ${overdueCount} vencida${overdueCount !== 1 ? 's' : ''}` : 'Al día ✓'}
            icon={<Clock size={18} className={overdueCount > 0 ? 'text-red-500' : 'text-amber-500'} />}
            variant="default"
          />
          <StatCard
            label="Ya pagado"
            value={formatCurrency(paid.reduce((s, d) => s + d.amount, 0))}
            subtext={`${paid.length} deuda${paid.length !== 1 ? 's' : ''} saldada${paid.length !== 1 ? 's' : ''}`}
            icon={<CheckCircle2 size={18} className="text-emerald-500" />}
            variant="income"
          />
        </div>

        {/* Overdue alert */}
        {overdueCount > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>Tienes <strong>{overdueCount}</strong> deuda{overdueCount !== 1 ? 's' : ''} vencida{overdueCount !== 1 ? 's' : ''}. Ponla{overdueCount !== 1 ? 's' : ''} al día para evitar intereses.</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex justify-end">
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Nueva deuda
          </button>
        </div>

        {/* ── Pending ── */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Pendientes</h2>

          {/* Mobile */}
          <div className="md:hidden card overflow-hidden">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
              </div>
            ) : pending.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-gray-400">
                <Banknote size={28} />
                <p className="text-sm">Sin deudas pendientes 🎉</p>
              </div>
            ) : (
              <div className="divide-y divide-pink-50">
                {pending.map((debt) => {
                  const overdue = isOverdue(debt)
                  const dueMonth = isDueThisMonth(debt)
                  return (
                    <SwipeableRow
                      key={debt.id}
                      actions={[
                        { icon: <Pencil size={15} color="white" />,       label: 'Editar',  color: '#f43f5e', onClick: () => openEdit(debt) },
                        { icon: <CheckCircle2 size={15} color="white" />, label: 'Pagada',  color: '#10b981', onClick: () => setConfirming(debt) },
                        { icon: <Trash2 size={15} color="white" />,       label: 'Eliminar',color: '#a78bfa', onClick: () => setDeleting(debt) },
                      ] satisfies SwipeAction[]}
                    >
                      <div className={`flex items-center justify-between gap-3 px-4 py-3.5 ${overdue ? 'bg-red-50/40' : 'bg-white'}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {overdue && <AlertCircle size={12} className="shrink-0 text-red-400" />}
                            <p className="text-sm font-semibold text-gray-900 truncate">{debt.creditor_name}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {debt.due_date && (
                              <span className={`text-xs font-medium ${overdue ? 'text-red-500' : dueMonth ? 'text-amber-500' : 'text-gray-400'}`}>
                                {overdue ? '⚠️ Venció ' : 'Vence '}
                                {format(parseISO(debt.due_date), 'dd MMM', { locale: es })}
                              </span>
                            )}
                            {debt.description && (
                              <span className="text-xs text-gray-400 truncate max-w-[130px]">{debt.description}</span>
                            )}
                          </div>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ${overdue ? 'text-red-500' : 'text-rose-500'}`}>
                          {formatCurrency(debt.amount)}
                        </span>
                      </div>
                    </SwipeableRow>
                  )
                })}
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t-2 border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">Total pendiente</span>
                  <span className="text-sm font-bold text-rose-500">{formatCurrency(totalPending)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop */}
          <div className="hidden md:block card overflow-hidden">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
              </div>
            ) : pending.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 text-gray-400">
                <Banknote size={28} />
                <p className="text-sm">Sin deudas pendientes 🎉</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead className="border-b border-pink-50 bg-pink-50/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Acreedor</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Descripción</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Fecha límite</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Monto</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {pending.map((debt) => {
                      const overdue = isOverdue(debt)
                      const dueMonth = isDueThisMonth(debt)
                      return (
                        <tr key={debt.id} className={`hover:bg-pink-50/30 ${overdue ? 'bg-red-50/30' : ''}`}>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              {overdue && <AlertCircle size={13} className="text-red-400 shrink-0" />}
                              {debt.creditor_name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{debt.description ?? '—'}</td>
                          <td className="px-4 py-3">
                            {debt.due_date ? (
                              <span className={`text-xs font-medium ${overdue ? 'text-red-500' : dueMonth ? 'text-amber-500' : 'text-gray-500'}`}>
                                {overdue ? '⚠️ ' : ''}{format(parseISO(debt.due_date), 'dd MMM yyyy', { locale: es })}
                              </span>
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className={`px-4 py-3 text-right font-semibold ${overdue ? 'text-red-500' : 'text-rose-500'}`}>
                            {formatCurrency(debt.amount)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => openEdit(debt)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><Pencil size={14} /></button>
                              <button onClick={() => setConfirming(debt)} className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500"><CheckCircle2 size={14} /></button>
                              <button onClick={() => setDeleting(debt)} className="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-400"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-700">Total pendiente</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-rose-500">{formatCurrency(totalPending)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Paid ── */}
        {paid.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">Pagadas</h2>

            {/* Mobile */}
            <div className="md:hidden card overflow-hidden">
              <div className="divide-y divide-green-50">
                {paid.map((debt) => (
                  <SwipeableRow
                    key={debt.id}
                    actions={[
                      { icon: <Trash2 size={15} color="white" />, label: 'Eliminar', color: '#a78bfa', onClick: () => setDeleting(debt) },
                    ] satisfies SwipeAction[]}
                  >
                    <div className="flex items-center justify-between gap-3 px-4 py-3.5 bg-white opacity-65">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />
                          <p className="text-sm font-semibold text-gray-700 truncate">{debt.creditor_name}</p>
                        </div>
                        {debt.paid_date && (
                          <span className="text-xs text-gray-400 mt-1 block">
                            Pagada el {format(parseISO(debt.paid_date), 'dd MMM yyyy', { locale: es })}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-emerald-500 shrink-0">{formatCurrency(debt.amount)}</span>
                    </div>
                  </SwipeableRow>
                ))}
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:block card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead className="border-b border-pink-50 bg-pink-50/40">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Acreedor</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Descripción</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Fecha pago</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500">Monto</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-50">
                    {paid.map((debt) => (
                      <tr key={debt.id} className="hover:bg-pink-50/30 opacity-65">
                        <td className="px-4 py-3 font-medium text-gray-700">{debt.creditor_name}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{debt.description ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {debt.paid_date ? format(parseISO(debt.paid_date), 'dd MMM yyyy', { locale: es }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-500">{formatCurrency(debt.amount)}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setDeleting(debt)} className="rounded-lg p-1.5 text-gray-300 hover:bg-violet-50 hover:text-violet-400"><Trash2 size={14} /></button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar deuda' : 'Nueva deuda'}>
        <DebtForm initial={editing ?? undefined} onClose={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={confirmPaid}
        title="¿Pagaste esta deuda?"
        description={`¿Confirmas que pagaste ${confirming ? formatCurrency(confirming.amount) : ''} a ${confirming?.creditor_name}?`}
        isLoading={markPaid.isPending}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Eliminar deuda"
        description={`¿Eliminar la deuda con ${deleting?.creditor_name} por ${deleting ? formatCurrency(deleting.amount) : ''}?`}
        isLoading={deleteDebt.isPending}
      />
    </div>
  )
}
