import { NavLink } from 'react-router-dom'
import { Home, LayoutDashboard, TrendingUp, TrendingDown, RepeatIcon } from 'lucide-react'
import clsx from 'clsx'

const links = [
  { to: '/',             label: 'Inicio',    icon: Home,            end: true },
  { to: '/dashboard',    label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/ingresos',     label: 'Ingresos',  icon: TrendingUp },
  { to: '/gastos',       label: 'Gastos',    icon: TrendingDown },
  { to: '/gastos-fijos', label: 'Fijos',     icon: RepeatIcon },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-stretch border-t border-pink-100 bg-white/95 backdrop-blur-sm safe-area-pb">
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            clsx(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition',
              isActive ? 'text-pink-500' : 'text-gray-400',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={20} className={isActive ? 'text-pink-400' : 'text-gray-300'} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
