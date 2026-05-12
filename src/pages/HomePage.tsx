import { useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/ui/Modal'
import IncomeForm from '../modules/income/components/IncomeForm'
import ExpenseForm from '../modules/expenses/components/ExpenseForm'
import NotificationBell from '../components/ui/NotificationBell'

function getGreeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return { text: 'Buenos días', emoji: '🌅' }
  if (h >= 12 && h < 19) return { text: 'Buenas tardes', emoji: '☀️' }
  return { text: 'Buenas noches', emoji: '🌙' }
}


export default function HomePage() {
  const { profile } = useAuth()
  const [incomeOpen, setIncomeOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [incomePressed, setIncomePressed] = useState(false)
  const [expensePressed, setExpensePressed] = useState(false)

  const firstName = profile?.full_name?.split(' ')[0] ?? 'hola'
  const greeting = getGreeting()
  const today = format(new Date(), "EEEE d 'de' MMMM", { locale: es })

  return (
    <>
      <style>{`
        @keyframes float-orb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-18px) scale(1.04); }
        }
        @keyframes card-glow-in {
          from { opacity: 0; transform: translateY(28px) scale(0.93); }
          to   { opacity: 1; transform: translateY(0px) scale(1); }
        }
        .home-card-income  { animation: card-glow-in 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.1s  both; }
        .home-card-expense { animation: card-glow-in 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.22s both; }
      `}</style>

      <div
        className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-5 md:p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #fdf2f8 0%, #f5f3ff 45%, #fdf4ff 100%)' }}
      >
        {/* Floating background orbs */}
        <div style={{ position:'absolute', top:'8%',  left:'12%',  width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(249,168,212,0.28) 0%, transparent 70%)', animation:'float-orb 7s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'14%', right:'10%', width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.22) 0%, transparent 70%)', animation:'float-orb 9s ease-in-out infinite 1.5s', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'55%', left:'5%',   width:100, height:100, borderRadius:'50%', background:'radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)', animation:'float-orb 6s ease-in-out infinite 0.8s', pointerEvents:'none' }} />

        {/* Notification bell */}
        <div className="absolute top-0 right-0 p-2" style={{ zIndex: 10 }}>
          <NotificationBell />
        </div>

        {/* Greeting */}
        <div className="mb-10 text-center" style={{ position: 'relative', zIndex: 5 }}>
          {/* Date chip */}
          <div
            className="inline-flex items-center gap-1.5 mb-5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500"
            style={{
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: '0 2px 12px rgba(236,72,153,0.1)',
              textTransform: 'capitalize',
            }}
          >
            <span>{greeting.emoji}</span>
            <span>{today}</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-700 mb-2">
            {greeting.text},{' '}
            <span className="bg-gradient-to-r from-pink-500 to-violet-400 bg-clip-text text-transparent capitalize">
              {firstName}
            </span>{' '}
            ✨
          </h1>
          <p className="text-gray-400 text-sm">¿Qué quieres registrar hoy?</p>
        </div>

        {/* Action cards */}
        <div
          className="flex flex-col sm:flex-row gap-5 w-full max-w-sm sm:max-w-md"
          style={{ position: 'relative', zIndex: 5 }}
        >
          {/* Income card */}
          <button
            className="home-card-income group flex-1 flex flex-col items-center gap-4"
            onPointerDown={() => setIncomePressed(true)}
            onPointerUp={() => setIncomePressed(false)}
            onPointerLeave={() => setIncomePressed(false)}
            onClick={() => setIncomeOpen(true)}
            style={{
              padding: '2rem 1.5rem',
              borderRadius: 28,
              background: 'rgba(240,253,244,0.82)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1.5px solid rgba(52,211,153,0.35)',
              boxShadow: incomePressed
                ? '0 2px 10px rgba(52,211,153,0.15)'
                : '0 8px 32px rgba(52,211,153,0.22), 0 1px 0 rgba(255,255,255,0.85) inset',
              transform: incomePressed ? 'scale(0.94)' : 'scale(1)',
              transition: incomePressed
                ? 'transform 0.1s ease, box-shadow 0.1s ease'
                : 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease',
              cursor: 'pointer',
              outline: 'none',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'45%', borderRadius:'28px 28px 60% 60%', background:'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)', pointerEvents:'none' }} />
            <div style={{ width:68, height:68, borderRadius:20, background:'linear-gradient(135deg, rgba(52,211,153,0.25) 0%, rgba(16,185,129,0.35) 100%)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', border:'1.5px solid rgba(52,211,153,0.4)', boxShadow:'0 4px 16px rgba(52,211,153,0.25), inset 0 1px 0 rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <TrendingUp size={28} style={{ color: '#10b981' }} />
            </div>
            <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
              <p className="text-lg font-bold text-gray-700">Agregar ingreso</p>
              <p className="text-xs text-gray-400 mt-1">Salario, freelance, extra…</p>
            </div>
          </button>

          {/* Expense card */}
          <button
            className="home-card-expense group flex-1 flex flex-col items-center gap-4"
            onPointerDown={() => setExpensePressed(true)}
            onPointerUp={() => setExpensePressed(false)}
            onPointerLeave={() => setExpensePressed(false)}
            onClick={() => setExpenseOpen(true)}
            style={{
              padding: '2rem 1.5rem',
              borderRadius: 28,
              background: 'rgba(255,241,242,0.82)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1.5px solid rgba(251,113,133,0.32)',
              boxShadow: expensePressed
                ? '0 2px 10px rgba(251,113,133,0.15)'
                : '0 8px 32px rgba(236,72,153,0.2), 0 1px 0 rgba(255,255,255,0.85) inset',
              transform: expensePressed ? 'scale(0.94)' : 'scale(1)',
              transition: expensePressed
                ? 'transform 0.1s ease, box-shadow 0.1s ease'
                : 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease',
              cursor: 'pointer',
              outline: 'none',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position:'absolute', top:0, left:0, right:0, height:'45%', borderRadius:'28px 28px 60% 60%', background:'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, transparent 100%)', pointerEvents:'none' }} />
            <div style={{ width:68, height:68, borderRadius:20, background:'linear-gradient(135deg, rgba(251,113,133,0.22) 0%, rgba(236,72,153,0.32) 100%)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)', border:'1.5px solid rgba(251,113,133,0.4)', boxShadow:'0 4px 16px rgba(236,72,153,0.22), inset 0 1px 0 rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <TrendingDown size={28} style={{ color: '#ec4899' }} />
            </div>
            <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
              <p className="text-lg font-bold text-gray-700">Agregar gasto</p>
              <p className="text-xs text-gray-400 mt-1">Comida, transporte, ocio…</p>
            </div>
          </button>
        </div>

      </div>

      <Modal isOpen={incomeOpen} onClose={() => setIncomeOpen(false)} title="Nuevo ingreso">
        <IncomeForm onClose={() => setIncomeOpen(false)} />
      </Modal>

      <Modal isOpen={expenseOpen} onClose={() => setExpenseOpen(false)} title="Nuevo gasto">
        <ExpenseForm onClose={() => setExpenseOpen(false)} />
      </Modal>
    </>
  )
}
