import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, LayoutDashboard, TrendingUp, TrendingDown,
  RepeatIcon, HandCoins, Landmark, Menu, X, Sparkles, ArrowUpDown, ShieldCheck, CalendarDays
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/',             label: 'Inicio',       icon: Home,            end: true,  color: '#f9a8d4', bg: '#fdf2f8' },
  { to: '/dashboard',   label: 'Dashboard',    icon: LayoutDashboard, end: true,  color: '#c084fc', bg: '#faf5ff' },
  { to: '/ingresos',    label: 'Ingresos',     icon: TrendingUp,      end: false, color: '#34d399', bg: '#f0fdf4' },
  { to: '/gastos',      label: 'Gastos',       icon: TrendingDown,    end: false, color: '#fb7185', bg: '#fff1f2' },
  { to: '/gastos-fijos',label: 'Gastos fijos', icon: RepeatIcon,      end: false, color: '#a78bfa', bg: '#f5f3ff' },
  { to: '/prestamos',   label: 'Préstamos',    icon: HandCoins,       end: false, color: '#f59e0b', bg: '#fffbeb' },
  { to: '/cuentas',     label: 'Cuentas',      icon: Landmark,        end: false, color: '#60a5fa', bg: '#eff6ff' },
  { to: '/movimientos', label: 'Movimientos',  icon: ArrowUpDown,     end: false, color: '#f472b6', bg: '#fdf2f8' },
  { to: '/calendario',  label: 'Calendario',   icon: CalendarDays,    end: false, color: '#34d399', bg: '#f0fdf4' },
]

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { profile } = useAuth()

  return (
    <>
      {/* Bottom bar */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-center justify-between px-5 border-t border-pink-100/80"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 30px)',
          paddingTop: '12px',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <NavLink to="/" className="flex items-center gap-2 active:scale-95" style={{ transition: 'transform 0.1s ease' }}>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-violet-300 shadow-sm shadow-pink-200">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-base font-bold bg-gradient-to-r from-pink-500 to-violet-400 bg-clip-text text-transparent">
            GirlMath 🎀
          </span>
        </NavLink>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-semibold transition"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: 'white', boxShadow: '0 4px 14px rgba(236,72,153,0.3)' }}
        >
          <Menu size={18} />
          Menú
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={clsx(
          'md:hidden fixed inset-0 z-40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', transition: 'opacity 0.25s ease' }}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className={clsx(
          'md:hidden fixed inset-x-0 bottom-0 z-50',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{
          borderRadius: '28px 28px 0 0',
          background: 'linear-gradient(160deg, #fff5f9 0%, #fdf4ff 100%)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)',
          boxShadow: '0 -8px 40px rgba(236,72,153,0.15)',
          transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-pink-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div>
            <p className="text-lg font-bold text-gray-800">Módulos</p>
            <p className="text-xs text-pink-400">¿A dónde quieres ir?</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-pink-400 shadow-sm border border-pink-100"
          >
            <X size={17} />
          </button>
        </div>

        {/* Grid */}
        <nav className="px-4 grid grid-cols-2 gap-3">
          {[...links, ...(profile?.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck, end: false, color: '#a78bfa', bg: '#f5f3ff' }] : [])].map(({ to, label, icon: Icon, end, color, bg }, idx) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className="block list-item-enter"
              style={{ animationDelay: `${idx * 35}ms` }}
            >
              {({ isActive }) => (
                <div
                  className="flex items-center gap-3 rounded-2xl px-4 py-3.5 active:scale-[0.97]"
                  style={{
                    background: isActive ? bg : 'white',
                    border: `1.5px solid ${isActive ? color + '60' : '#fce7f3'}`,
                    boxShadow: isActive ? `0 4px 16px ${color}25` : '0 1px 4px rgba(0,0,0,0.04)',
                    transition: 'background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease',
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: bg, border: `1.5px solid ${color}40` }}
                  >
                    <Icon size={17} style={{ color }} />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: isActive ? color : '#374151' }}>
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}
