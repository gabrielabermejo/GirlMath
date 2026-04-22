import { useState } from 'react'
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/ui/Modal'
import IncomeForm from '../modules/income/components/IncomeForm'
import ExpenseForm from '../modules/expenses/components/ExpenseForm'

export default function HomePage() {
  const { profile } = useAuth()
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)

  const firstName = profile?.full_name?.split(' ')[0] ?? 'hola'

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-5 md:p-8">
      {/* Greeting */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-pink-300 to-violet-200 shadow-lg shadow-pink-100 mb-4">
          <Sparkles size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-700 mb-2">
          Hola, <span className="bg-gradient-to-r from-pink-500 to-violet-400 bg-clip-text text-transparent capitalize">{firstName}</span> ✨
        </h1>
        <p className="text-gray-400 text-sm">¿Qué quieres registrar hoy?</p>
      </div>

      {/* Action cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm sm:max-w-md">
        {/* Ingreso */}
        <button
          onClick={() => setIncomeOpen(true)}
          className="group flex-1 flex flex-col items-center gap-4 rounded-2xl border-2 border-green-100 bg-white p-6 md:p-8 shadow-sm transition-all hover:border-green-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 transition-colors group-hover:bg-green-200">
            <TrendingUp size={28} className="text-green-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-700">Agregar ingreso</p>
            <p className="text-xs text-gray-400 mt-1">Salario, freelance, extra…</p>
          </div>
        </button>

        {/* Gasto */}
        <button
          onClick={() => setExpenseOpen(true)}
          className="group flex-1 flex flex-col items-center gap-4 rounded-2xl border-2 border-pink-100 bg-white p-8 shadow-sm transition-all hover:border-pink-200 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-100 transition-colors group-hover:bg-pink-200">
            <TrendingDown size={28} className="text-pink-400" />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-700">Agregar gasto</p>
            <p className="text-xs text-gray-400 mt-1">Comida, transporte, ocio…</p>
          </div>
        </button>
      </div>

      {/* Hint */}
      <p className="mt-10 text-xs text-pink-300">
        Usa el menú para ver tu dashboard y reportes
      </p>

      {/* Modals */}
      <Modal isOpen={incomeOpen} onClose={() => setIncomeOpen(false)} title="Nuevo ingreso">
        <IncomeForm onClose={() => setIncomeOpen(false)} />
      </Modal>

      <Modal isOpen={expenseOpen} onClose={() => setExpenseOpen(false)} title="Nuevo gasto">
        <ExpenseForm onClose={() => setExpenseOpen(false)} />
      </Modal>
    </div>
  )
}
