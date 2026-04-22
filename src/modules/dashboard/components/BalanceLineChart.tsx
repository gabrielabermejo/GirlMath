import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { MonthlyBalance } from '../../../types'
import { formatCurrency } from '../../../lib/utils'

interface Props {
  data: MonthlyBalance[]
}

export default function BalanceLineChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            v >= 1_000_000
              ? `${(v / 1_000_000).toFixed(1)}M`
              : v >= 1000
              ? `${(v / 1000).toFixed(0)}k`
              : String(v)
          }
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {value === 'income' ? 'Ingresos' : value === 'expenses' ? 'Gastos' : 'Balance'}
            </span>
          )}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={false}
          strokeDasharray="5 3"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
