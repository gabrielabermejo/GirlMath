import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { FiltersProvider } from './context/FiltersContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import DashboardPage from './modules/dashboard/DashboardPage'
import IncomePage from './modules/income/IncomePage'
import ExpensesPage from './modules/expenses/ExpensesPage'
import FixedExpensesPage from './modules/fixed-expenses/FixedExpensesPage'
import LoansPage from './modules/loans/LoansPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FiltersProvider>
          <BrowserRouter>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >

                <Route index element={<HomePage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="ingresos" element={<IncomePage />} />
                <Route path="gastos" element={<ExpensesPage />} />
                <Route path="gastos-fijos" element={<FixedExpensesPage />} />
                <Route path="prestamos" element={<LoansPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </FiltersProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
