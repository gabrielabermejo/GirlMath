import { useState } from 'react'
import { Plus, Pencil, Trash2, Landmark } from 'lucide-react'
import Header from '../../components/layout/Header'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import BankAccountForm from './components/BankAccountForm'
import { useBankAccounts } from './hooks/useBankAccounts'
import { useDeleteBankAccount } from './hooks/useMutateBankAccount'
import { BankAccount } from '../../types'

export default function BankAccountsPage() {
  const { data: accounts = [], isLoading } = useBankAccounts()
  const deleteAccount = useDeleteBankAccount()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<BankAccount | null>(null)
  const [deleting, setDeleting] = useState<BankAccount | null>(null)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(a: BankAccount) {
    setEditing(a)
    setModalOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    await deleteAccount.mutateAsync(deleting.id)
    setDeleting(null)
  }

  return (
    <div>
      <Header title="Cuentas de banco" subtitle="Tus cuentas para organizar ingresos" />

      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex justify-end">
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} />
            Nueva cuenta
          </button>
        </div>

        <div className="card overflow-hidden">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
              <Landmark size={32} />
              <p className="text-sm">No tienes cuentas registradas</p>
              <p className="text-xs">Agrega tu cuenta de banco o billetera digital</p>
            </div>
          ) : (
            <div className="divide-y divide-pink-50">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center gap-4 px-4 py-4 hover:bg-pink-50/30">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: account.color + '30', border: `2px solid ${account.color}` }}
                  >
                    <Landmark size={18} style={{ color: account.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{account.name}</p>
                    <p className="text-xs text-gray-400 truncate">{account.bank}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(account)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleting(account)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-violet-50 hover:text-violet-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar cuenta' : 'Nueva cuenta de banco'}
      >
        <BankAccountForm initial={editing ?? undefined} onClose={() => setModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Eliminar cuenta"
        description={`¿Seguro que quieres eliminar "${deleting?.name}"?`}
        isLoading={deleteAccount.isPending}
      />
    </div>
  )
}
