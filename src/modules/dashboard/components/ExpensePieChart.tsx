import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CategoryTotal } from '../../../types'
import { formatCurrency } from '../../../lib/utils'

interface Props {
  data: CategoryTotal[]
}

export default function ExpensePieChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Sin gastos en este período
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell key={entry.category} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
