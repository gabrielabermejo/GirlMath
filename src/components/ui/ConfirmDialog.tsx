import Modal from './Modal'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  isLoading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
}: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onClose} disabled={isLoading}>
          Cancelar
        </button>
        <button className="btn-danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  )
}
