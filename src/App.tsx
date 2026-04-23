import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import OneSignal from 'react-onesignal'
import { useEffect } from 'react'
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
import BankAccountsPage from './modules/bank-accounts/BankAccountsPage'
import MovimientosPage from './modules/movimientos/MovimientosPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export default function App() {
  useEffect(() => {
    OneSignal.init({
      appId: '0c6a8d7d-ad27-483e-a9bf-ef1a73dc3baf',
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerParam: { scope: '/' },
      serviceWorkerPath: 'OneSignalSDKWorker.js',
    }).then(() => {
      // Listen for subscription changes and save player_id
      OneSignal.User.PushSubscription.addEventListener('change', async (event) => {
        const playerId = event.current.id
        if (!playerId) return
        const { data: { session } } = await import('./lib/supabase').then(m =>
          m.supabase.auth.getSession()
        )
        if (!session?.user) return
        const { supabase } = await import('./lib/supabase')
        await supabase.from('push_subscriptions').upsert(
          { user_id: session.user.id, player_id: playerId },
          { onConflict: 'user_id' }
        )
      })
    })
  }, [])

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
                <Route path="cuentas" element={<BankAccountsPage />} />
                <Route path="movimientos" element={<MovimientosPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </FiltersProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
