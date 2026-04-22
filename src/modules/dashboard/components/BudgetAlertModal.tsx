import { createPortal } from 'react-dom'
import { ShieldAlert, AlertCircle, AlertTriangle, PiggyBank, X } from 'lucide-react'
import clsx from 'clsx'
import { formatCurrency } from '../../../lib/utils'

type Level = 'exceeded' | 'critical' | 'warning'

interface Props {
  level: Level
  spentPct: number
  totalSpent: number
  availableBudget: number
  remaining: number
  savingsGoal: number
  onClose: () => void
}

const config = {
  exceeded: {
    Icon: ShieldAlert,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-500',
    headerBg: 'bg-gradient-to-r from-violet-300 to-purple-200',
    barColor: 'bg-violet-300',
    overColor: 'text-violet-500',
    title: '¡Superaste tu presupuesto disponible!',
    subtitle: 'Tu meta de ahorro está en riesgo este mes.',
    tip: 'Evita nuevos gastos y revisa si puedes reducir algún gasto variable.',
  },
  critical: {
    Icon: AlertCircle,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-400',
    headerBg: 'bg-gradient-to-r from-blue-200 to-sky-100',
    barColor: 'bg-blue-300',
    overColor: 'text-blue-500',
    title: 'Estás casi en tu límite',
    subtitle: 'Queda muy poco presupuesto disponible este mes.',
    tip: 'Solo realiza gastos estrictamente necesarios para proteger tu ahorro.',
  },
  warning: {
    Icon: AlertTriangle,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-500',
    headerBg: 'bg-gradient-to-r from-yellow-200 to-yellow-100',
    barColor: 'bg-yellow-300',
    overColor: 'text-yellow-600',
    title: 'El dinero se está agotando',
    subtitle: 'Has gastado más del 75% de tu presupuesto disponible.',
    tip: 'Modera tus gastos para llegar a fin de mes sin comprometer tu ahorro.',
  },
} as const

export default function BudgetAlertModal({
  level, spentPct, totalSpent, availableBudget, remaining, savingsGoal, onClose,
}: Props) {
  const cfg = config[level]
  const Icon = cfg.Icon
  const overLimit = spentPct > 100

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="card relative w-full max-w-md overflow-hidden shadow-2xl border-pink-100">
        {/* Pastel header */}
        <div className={clsx('px-6 py-5', cfg.headerBg)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={clsx('rounded-full p-2 bg-white/50', cfg.iconBg)}>
                <Icon size={20} className={cfg.iconColor} />
              </div>
              <div>
                <p className="font-bold text-gray-700 text-base">{cfg.title}</p>
                <p className="text-sm text-gray-500">{cfg.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-white/40"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-pink-50 p-3 border border-pink-100">
              <p className="text-xs text-gray-400 mb-1">Presupuesto</p>
              <p className="text-sm font-bold text-gray-700">{formatCurrency(availableBudget)}</p>
              <p className="text-xs text-gray-400">para gastar</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 border border-blue-100">
              <p className="text-xs text-gray-400 mb-1">Gastado</p>
              <p className={clsx('text-sm font-bold', overLimit ? cfg.overColor : 'text-gray-700')}>
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-xs text-gray-400">{spentPct.toFixed(0)}%</p>
            </div>
            <div className="rounded-xl bg-green-50 p-3 border border-green-100">
              <p className="text-xs text-gray-400 mb-1">{overLimit ? 'Excedido' : 'Disponible'}</p>
              <p className={clsx('text-sm font-bold', overLimit ? cfg.overColor : 'text-green-600')}>
                {formatCurrency(Math.abs(remaining))}
              </p>
              <p className="text-xs text-gray-400">{overLimit ? 'de más' : 'restante'}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Uso del presupuesto disponible</span>
              <span className="font-medium">{Math.min(spentPct, 100).toFixed(0)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={clsx('h-full rounded-full transition-all', cfg.barColor)}
                style={{ width: `${Math.min(spentPct, 100)}%` }}
              />
            </div>
            {overLimit && (
              <p className={clsx('mt-1 text-xs font-medium', cfg.overColor)}>
                +{(spentPct - 100).toFixed(0)}% sobre el límite
              </p>
            )}
          </div>

          {/* Savings goal reminder */}
          <div className="flex items-center gap-2 rounded-xl bg-pink-50 px-3 py-2.5 border border-pink-100">
            <PiggyBank size={15} className="shrink-0 text-pink-400" />
            <p className="text-xs text-pink-600">
              Tu meta es ahorrar el <strong>{savingsGoal}%</strong> de tus ingresos cada mes.
              {!overLimit
                ? ' Aún puedes lograrlo si reduces tus gastos.'
                : ' Considera ingresos adicionales para recuperar tu meta.'}
            </p>
          </div>

          <p className="text-xs text-gray-400 italic">{cfg.tip}</p>

          <button onClick={onClose} className="btn-primary w-full">
            Entendido, voy a revisar mis gastos ✨
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
