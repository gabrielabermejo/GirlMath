import { NavLink } from 'react-router-dom'
import { Home, LayoutDashboard, TrendingUp, TrendingDown, Sparkles, RepeatIcon, LogOut, HandCoins, Landmark, ArrowUpDown, ShieldCheck, CalendarDays } from 'lucide-react'
import clsx from 'clsx'
import { useSidebar } from '../../context/SidebarContext'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/',             label: 'Inicio',       icon: Home,            end: true },
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/ingresos',     label: 'Ingresos',     icon: TrendingUp },
  { to: '/gastos',       label: 'Gastos',       icon: TrendingDown },
  { to: '/gastos-fijos', label: 'Gastos fijos', icon: RepeatIcon },
  { to: '/prestamos',    label: 'Préstamos',    icon: HandCoins },
  { to: '/cuentas',      label: 'Cuentas',      icon: Landmark },
  { to: '/movimientos',  label: 'Movimientos',  icon: ArrowUpDown },
  { to: '/calendario',   label: 'Calendario',   icon: CalendarDays },
]

export default function Sidebar() {
  const { close } = useSidebar()
  const { signOut, profile } = useAuth()

  return (
    <aside className="flex h-full w-60 flex-col border-r border-pink-100 bg-white">
      <div className="flex h-14 md:h-16 items-center gap-2.5 border-b border-pink-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-violet-300 shadow-sm shrink-0">
          <Sparkles size={15} className="text-white" />
        </div>
        <span className="text-base font-bold bg-gradient-to-r from-pink-500 to-violet-400 bg-clip-text text-transparent">
          GirlMath
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3 overflow-y-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={close}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-pink-50 text-pink-500 shadow-sm'
                  : 'text-gray-400 hover:bg-pink-50/60 hover:text-pink-400',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-pink-400' : ''} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        {profile?.role === 'admin' && (
          <NavLink
            to="/admin"
            onClick={close}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition mt-1',
                isActive
                  ? 'bg-violet-50 text-violet-500 shadow-sm'
                  : 'text-violet-300 hover:bg-violet-50 hover:text-violet-400',
              )
            }
          >
            {({ isActive }) => (
              <>
                <ShieldCheck size={17} className={isActive ? 'text-violet-400' : ''} />
                Admin
              </>
            )}
          </NavLink>
        )}
      </nav>

      <div className="border-t border-pink-100 p-4 flex flex-col gap-3">
        <p className="text-xs text-pink-200">✨ Tu presupuesto personal</p>
        <button
          onClick={signOut}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-pink-400 hover:bg-pink-50 hover:text-pink-500 transition w-full"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
