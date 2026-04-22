import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react'
import { FiltersState, ExpenseCategory, SortBy, SortDir } from '../types'

interface FiltersContextValue {
  filters: FiltersState
  setMonth: (month: number) => void
  setYear: (year: number) => void
  setExpenseCategory: (cat: ExpenseCategory | 'all') => void
  setSortBy: (sortBy: SortBy) => void
  setSortDir: (dir: SortDir) => void
  resetFilters: () => void
  savingsGoal: number
  setSavingsGoal: (pct: number) => void
}

const now = new Date()

const defaultFilters: FiltersState = {
  month: now.getMonth(),
  year: now.getFullYear(),
  expenseCategory: 'all',
  sortBy: 'date',
  sortDir: 'desc',
}

const FiltersContext = createContext<FiltersContextValue | null>(null)

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FiltersState>(defaultFilters)
  const [savingsGoal, setSavingsGoalState] = useState<number>(() =>
    Number(localStorage.getItem('savings_goal') ?? '55'),
  )

  function setSavingsGoal(pct: number) {
    const clamped = Math.min(100, Math.max(0, pct))
    localStorage.setItem('savings_goal', String(clamped))
    setSavingsGoalState(clamped)
  }

  return (
    <FiltersContext.Provider
      value={{
        filters,
        setMonth: (month) => setFilters((f) => ({ ...f, month })),
        setYear: (year) => setFilters((f) => ({ ...f, year })),
        setExpenseCategory: (expenseCategory) =>
          setFilters((f) => ({ ...f, expenseCategory })),
        setSortBy: (sortBy) => setFilters((f) => ({ ...f, sortBy })),
        setSortDir: (sortDir) => setFilters((f) => ({ ...f, sortDir })),
        resetFilters: () => setFilters(defaultFilters),
        savingsGoal,
        setSavingsGoal,
      }}
    >
      {children}
    </FiltersContext.Provider>
  )
}

export function useFilters() {
  const ctx = useContext(FiltersContext)
  if (!ctx) throw new Error('useFilters must be used inside FiltersProvider')
  return ctx
}
