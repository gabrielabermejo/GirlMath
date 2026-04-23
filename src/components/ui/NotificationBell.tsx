import { useState, useRef, useEffect } from 'react'
import { Bell, RepeatIcon } from 'lucide-react'
import { useUpcomingFixedExpenses } from '../../hooks/useUpcomingFixedExpenses'
import { formatCurrency } from '../../lib/utils'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const upcoming = useUpcomingFixedExpenses(7)

  // Close on outside click/touch
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

  // Request browser notification permission and fire notifications
  useEffect(() => {
    if (!('Notification' in window) || upcoming.length === 0) return
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
    if (Notification.permission === 'granted') {
      upcoming
        .filter((e) => e.daysUntilDue <= 3)
        .forEach((e) => {
          const label = e.daysUntilDue === 0 ? 'hoy' : e.daysUntilDue === 1 ? 'mañana' : `en ${e.daysUntilDue} días`
          new Notification(`💸 Gasto fijo vence ${label}`, {
            body: `${e.description} — ${formatCurrency(e.amount)}`,
            icon: '/icon-192.svg',
          })
        })
    }
  // Only fire once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function duLabel(days: number) {
    if (days === 0) return { text: 'Hoy', color: '#ef4444' }
    if (days === 1) return { text: 'Mañana', color: '#f97316' }
    if (days <= 3) return { text: `En ${days} días`, color: '#f59e0b' }
    return { text: `En ${days} días`, color: '#a78bfa' }
  }

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-pink-50 transition"
      >
        <Bell size={19} className="text-pink-400" />
        {upcoming.length > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[9px] font-bold text-white">
            {upcoming.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-pink-100 bg-white shadow-xl z-20 overflow-hidden">
          <div className="px-4 py-3 border-b border-pink-50 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Gastos fijos próximos</p>
            <span className="text-xs text-pink-400">7 días</span>
          </div>

          {upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
              <Bell size={24} />
              <p className="text-sm">Sin vencimientos próximos</p>
            </div>
          ) : (
            <div className="divide-y divide-pink-50 max-h-72 overflow-y-auto">
              {upcoming.map((e) => {
                const { text, color } = duLabel(e.daysUntilDue)
                return (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50/40">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                      <RepeatIcon size={15} className="text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{e.description}</p>
                      <p className="text-xs font-semibold" style={{ color }}>{text}</p>
                    </div>
                    <span className="text-sm font-bold text-violet-600 shrink-0">
                      {formatCurrency(e.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
