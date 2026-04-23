import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, LayoutDashboard, TrendingUp, TrendingDown,
  RepeatIcon, HandCoins, Landmark, Menu, X, Sparkles
} from 'lucide-react'
import clsx from 'clsx'

const links = [
  { to: '/',             label: 'Inicio',        icon: Home,            end: true },
  { to: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard, end: true },
  { to: '/ingresos',     label: 'Ingresos',      icon: TrendingUp },
  { to: '/gastos',       label: 'Gastos',        icon: TrendingDown },
  { to: '/gastos-fijos', label: 'Gastos fijos',  icon: RepeatIcon },
  { to: '/prestamos',    label: 'Préstamos',     icon: HandCoins },
  { to: '/cuentas',      label: 'Cuentas',       icon: Landmark },
]

export default function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Bottom bar with hamburger button */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-center justify-between border-t border-pink-100 bg-white/95 backdrop-blur-sm px-5"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)', paddingTop: '10px' }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-violet-300">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="text-sm font-bold bg-gradient-to-r from-pink-500 to-violet-400 bg-clip-text text-transparent">
            GirlMath
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center h-10 w-10 rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 transition"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer slide-up */}
      <div
        className={clsx(
          'md:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white transition-transform duration-300',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-pink-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-pink-50">
          <span className="text-sm font-semibold text-gray-700">Módulos</span>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center h-8 w-8 rounded-xl bg-pink-50 text-pink-400 hover:bg-pink-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Links */}
        <nav className="p-4 grid grid-cols-2 gap-2">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-pink-50 text-pink-500 shadow-sm'
                    : 'text-gray-500 hover:bg-pink-50/60 hover:text-pink-400',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-pink-400' : 'text-gray-400'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  )
}
