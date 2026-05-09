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
import CalendarioPage from './modules/calendario/CalendarioPage'
import AdminPage from './modules/admin/AdminPage'
import SavingsPage from './modules/savings/SavingsPage'
import PendingPage from './pages/PendingPage'

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
            <Toaster
              position="top-center"
              gutter={8}
              containerStyle={{ top: 20 }}
              toastOptions={{
                duration: 2500,
                style: {
                  background: 'rgba(255,255,255,0.88)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.75)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
                  borderRadius: 18,
                  padding: '10px 16px',
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 600,
                  maxWidth: 320,
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: 'white' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: 'white' },
                },
              }}
            />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/pending" element={<PendingPage />} />
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
                <Route path="ahorro" element={<SavingsPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="calendario" element={<CalendarioPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </FiltersProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
