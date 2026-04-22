import { ReactNode } from 'react'
import clsx from 'clsx'

interface Props {
  label: string
  value: string
  subtext?: string
  icon: ReactNode
  variant?: 'default' | 'income' | 'expense' | 'balance-positive' | 'balance-negative'
}

const card = {
  default:            'bg-white border-pink-100 text-gray-700',
  income:             'bg-green-50 border-green-100 text-green-700',
  expense:            'bg-pink-50 border-pink-100 text-pink-600',
  'balance-positive': 'bg-gradient-to-br from-green-300 to-emerald-200 border-0 text-white',
  'balance-negative': 'bg-gradient-to-br from-violet-300 to-purple-200 border-0 text-white',
}

const iconWrap = {
  default:            'bg-pink-100',
  income:             'bg-green-100',
  expense:            'bg-pink-100',
  'balance-positive': 'bg-white/25',
  'balance-negative': 'bg-white/25',
}

export default function StatCard({ label, value, subtext, icon, variant = 'default' }: Props) {
  return (
    <div className={clsx('rounded-2xl border p-5 shadow-sm', card[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide opacity-60">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {subtext && <p className="mt-1 text-xs opacity-60">{subtext}</p>}
        </div>
        <div className={clsx('rounded-xl p-2', iconWrap[variant])}>{icon}</div>
      </div>
    </div>
  )
}
