import { useState, useRef, useEffect } from 'react'
import { LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../ui/NotificationBell'

interface Props {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: Props) {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handler(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '✨'

  return (
    <header className="flex h-14 md:h-16 items-center justify-between border-b border-pink-100 bg-white/80 backdrop-blur-sm px-4 md:px-6 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-bold text-gray-700 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-pink-300 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <NotificationBell />

      {/* User menu */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl px-2 md:px-3 py-1.5 hover:bg-pink-50 transition"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-300 to-violet-300 text-xs font-bold text-white shadow-sm shrink-0">
            {initials}
          </span>
          <span className="hidden sm:block text-sm text-gray-600 max-w-[120px] truncate">
            {profile?.full_name ?? 'Usuario'}
          </span>
          <ChevronDown size={14} className="text-pink-300" />
        </button>

        {open && (
          <div className="absolute right-0 mt-1 w-44 rounded-xl border border-pink-100 bg-white py-1 shadow-lg z-10">
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-violet-500 hover:bg-violet-50 transition"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
      </div>
    </header>
  )
}
