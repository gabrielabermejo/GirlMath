export interface Profile {
  id: string
  full_name: string
  created_at: string
}

export const EXPENSE_CATEGORIES = [
  'food',
  'transport',
  'entertainment',
  'housing',
  'health',
  'education',
  'other',
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'Comida',
  transport: 'Transporte',
  entertainment: 'Entretenimiento',
  housing: 'Vivienda',
  health: 'Salud',
  education: 'Educación',
  other: 'Otro',
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food:          '#f9a8d4', // pink-300      — rosa bebé
  transport:     '#93c5fd', // blue-300      — azul pastel
  entertainment: '#c4b5fd', // violet-300    — lila suave
  housing:       '#86efac', // green-300     — verde menta
  health:        '#fde047', // yellow-300    — amarillo suave
  education:     '#67e8f9', // cyan-300      — azul celeste
  other:         '#d8b4fe', // purple-300    — lavanda
}

export interface Income {
  id: string
  user_id: string
  amount: number
  date: string
  description: string
  category: string | null
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  amount: number
  date: string
  description: string
  category: ExpenseCategory
  created_at: string
}

export type SortBy = 'date' | 'amount'
export type SortDir = 'asc' | 'desc'

export interface FiltersState {
  month: number
  year: number
  expenseCategory: ExpenseCategory | 'all'
  sortBy: SortBy
  sortDir: SortDir
}

export interface CategoryTotal {
  category: ExpenseCategory
  label: string
  total: number
  color: string
}

export interface MonthlyBalance {
  label: string
  income: number
  expenses: number
  balance: number
}

export interface FixedExpense {
  id: string
  user_id: string
  amount: number
  description: string
  category: ExpenseCategory
  day_of_month: number | null
  created_at: string
}

export interface Loan {
  id: string
  user_id: string
  person_name: string
  amount: number
  lent_date: string
  status: 'pending' | 'paid'
  paid_date: string | null
  notes: string | null
  created_at: string
}

export interface SavingsStats {
  goalPct: number
  goalAmount: number
  totalSpent: number
  remaining: number
  onTrack: boolean
  savedAmount: number
  savedPct: number
}
