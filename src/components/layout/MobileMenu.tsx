import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home, LayoutDashboard, TrendingUp, TrendingDown,
  RepeatIcon, HandCoins, Landmark, Sparkles, X,
  ArrowUpDown, ShieldCheck, CalendarDays, PiggyBank, CreditCard,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/',             label: 'Inicio',      icon: Home,            color: '#f472b6', bg: 'rgba(253,242,248,0.95)' },
  { to: '/dashboard',    label: 'Dashboard',   icon: LayoutDashboard, color: '#c084fc', bg: 'rgba(250,245,255,0.95)' },
  { to: '/ingresos',     label: 'Ingresos',    icon: TrendingUp,      color: '#34d399', bg: 'rgba(240,253,244,0.95)' },
  { to: '/gastos',       label: 'Gastos',      icon: TrendingDown,    color: '#fb7185', bg: 'rgba(255,241,242,0.95)' },
  { to: '/gastos-fijos', label: 'Fijos',       icon: RepeatIcon,      color: '#a78bfa', bg: 'rgba(245,243,255,0.95)' },
  { to: '/prestamos',    label: 'Préstamos',   icon: HandCoins,       color: '#f59e0b', bg: 'rgba(255,251,235,0.95)' },
  { to: '/cuentas',      label: 'Cuentas',     icon: Landmark,        color: '#60a5fa', bg: 'rgba(239,246,255,0.95)' },
  { to: '/ahorro',       label: 'Ahorros',     icon: PiggyBank,       color: '#ec4899', bg: 'rgba(253,242,248,0.95)' },
  { to: '/deudas',       label: 'Deudas',      icon: CreditCard,      color: '#f43f5e', bg: 'rgba(255,241,242,0.95)' },
  { to: '/movimientos',  label: 'Movimientos', icon: ArrowUpDown,     color: '#f472b6', bg: 'rgba(253,242,248,0.95)' },
  { to: '/calendario',   label: 'Calendario',  icon: CalendarDays,    color: '#2dd4bf', bg: 'rgba(240,253,250,0.95)' },
]

const BASE_W   = 54    // chip width px
const BASE_H   = 66    // chip height px
const GAP_H    = 9     // horizontal gap between chips
const GAP_V    = 12    // vertical gap between rows
const MAX_S    = 1.72  // max scale
const SIGMA    = 1.18  // gaussian spread (in item units)

function dockScale(dist: number) {
  return 1 + (MAX_S - 1) * Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA))
}

interface Finger { col: number; row: number }

function Dock({ allLinks, onClose }: { allLinks: typeof links; onClose: () => void }) {
  const navigate  = useNavigate()
  const ref       = useRef<HTMLDivElement>(null)
  const hasDragged = useRef(false)
  const startPt   = useRef({ x: 0, y: 0 })

  const [finger,     setFinger]     = useState<Finger | null>(null)
  const [isTouching, setIsTouching] = useState(false)

  const row1 = allLinks.slice(0, 6)
  const row2 = allLinks.slice(6)

  function rowWidth(n: number) { return n * BASE_W + (n - 1) * GAP_H }

  function computeFinger(clientX: number, clientY: number) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return

    const relY = clientY - rect.top
    // row 0 center ≈ BASE_H/2, row 1 center ≈ BASE_H + GAP_V + BASE_H/2
    const r0cy = BASE_H / 2
    const r1cy = BASE_H + GAP_V + BASE_H / 2
    const rowFloat = (relY - r0cy) / (r1cy - r0cy)
    const nearRow  = rowFloat < 0.5 ? 0 : 1
    const rowItems = nearRow === 0 ? row1 : row2

    const rw        = rowWidth(rowItems.length)
    const rowStartX = (rect.width - rw) / 2
    const relX      = clientX - rect.left
    const colFloat  = (relX - rowStartX - BASE_W / 2) / (BASE_W + GAP_H)

    setFinger({ col: colFloat, row: rowFloat })
  }

  function getScale(rowIdx: number, colIdx: number) {
    if (!finger) return 1
    const dc = colIdx - finger.col
    const dr = (rowIdx - finger.row) * 1.4
    return dockScale(Math.sqrt(dc * dc + dr * dr))
  }

  function onTouchStart(e: React.TouchEvent) {
    startPt.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    hasDragged.current = false
    setIsTouching(true)
    computeFinger(e.touches[0].clientX, e.touches[0].clientY)
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = Math.abs(e.touches[0].clientX - startPt.current.x)
    const dy = Math.abs(e.touches[0].clientY - startPt.current.y)
    if (dx > 6 || dy > 6) hasDragged.current = true
    computeFinger(e.touches[0].clientX, e.touches[0].clientY)
  }

  function onTouchEnd() {
    setFinger(null)
    setIsTouching(false)
  }

  function tap(to: string) {
    if (!hasDragged.current) { navigate(to); onClose() }
  }

  function renderRow(items: typeof links, rowIdx: number) {
    return (
      <div style={{ display: 'flex', gap: GAP_H, justifyContent: 'center', alignItems: 'flex-end' }}>
        {items.map((link, colIdx) => {
          const s       = getScale(rowIdx, colIdx)
          const hot     = s > 1.25
          return (
            <button
              key={link.to}
              onClick={() => tap(link.to)}
              style={{
                width: BASE_W,
                height: BASE_H,
                flexShrink: 0,
                borderRadius: 18,
                background: link.bg,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `${hot ? 2 : 1.5}px solid ${link.color}${hot ? '62' : '24'}`,
                boxShadow: hot
                  ? `0 12px 36px ${link.color}52, inset 0 1px 0 rgba(255,255,255,0.88)`
                  : `0 4px 18px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.7)`,
                transform: `scale(${s})`,
                transformOrigin: 'center bottom',
                zIndex: Math.round(s * 10),
                transition: isTouching
                  ? 'transform 0.1s ease-out, box-shadow 0.1s ease, border-color 0.1s ease'
                  : 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.32s ease, border-color 0.3s ease',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 6,
                cursor: 'pointer', outline: 'none',
                position: 'relative',
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: `linear-gradient(135deg, ${link.color}${hot ? '38' : '1c'} 0%, ${link.color}${hot ? '55' : '2e'} 100%)`,
                border: `1px solid ${link.color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: hot ? `0 3px 12px ${link.color}35` : 'none',
                transition: 'background 0.15s ease, box-shadow 0.15s ease',
              }}>
                <link.icon size={16} style={{ color: link.color }} />
              </div>
              <span style={{
                fontSize: 9,
                fontWeight: hot ? 700 : 600,
                color: hot ? link.color : '#9ca3af',
                maxWidth: BASE_W - 6,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                textAlign: 'center',
                transition: 'color 0.15s ease',
              }}>
                {link.label}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      style={{
        touchAction: 'none',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: GAP_V,
        padding: '4px 12px 0',
        alignItems: 'center',
        width: '100%',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {renderRow(row1, 0)}
      {renderRow(row2, 1)}
    </div>
  )
}

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { profile } = useAuth()

  const allLinks = [
    ...links,
    ...(profile?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck, color: '#a78bfa', bg: 'rgba(245,243,255,0.95)' }]
      : []),
  ]

  return (
    <>
      <style>{`
        @keyframes fab-pulse {
          0%,100% { box-shadow: 0 8px 28px rgba(236,72,153,0.5), 0 0 0 0    rgba(236,72,153,0.25); }
          50%      { box-shadow: 0 8px 28px rgba(236,72,153,0.5), 0 0 0 10px rgba(236,72,153,0.0); }
        }
        .fab-idle { animation: fab-pulse 2.8s ease-in-out infinite; }
        @keyframes dock-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .dock-in { animation: dock-in 0.4s cubic-bezier(0.34,1.3,0.64,1) both; }
      `}</style>

      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-40"
        style={{
          background: 'rgba(0,0,0,0.52)',
          backdropFilter: open ? 'blur(16px)' : 'blur(0px)',
          WebkitBackdropFilter: open ? 'blur(16px)' : 'blur(0px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.3s ease, backdrop-filter 0.3s ease',
        }}
        onClick={() => setOpen(false)}
      />

      {/* Glass bottom strip */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-50"
        style={{
          height: 'calc(76px + max(env(safe-area-inset-bottom, 0px), 0px))',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 -4px 24px rgba(236,72,153,0.06)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating dock — no box, chips directly on backdrop */}
      {open && (
        <div
          className="dock-in md:hidden fixed inset-x-0 z-50"
          style={{
            bottom: 'calc(76px + max(env(safe-area-inset-bottom, 0px), 0px) + 20px)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Dock allLinks={allLinks} onClose={() => setOpen(false)} />
        </div>
      )}

      {/* FAB */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex justify-center"
        style={{
          paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 8px), 16px)',
          paddingTop: 8,
          pointerEvents: 'none',
        }}
      >
        <button
          onClick={() => setOpen(o => !o)}
          className={open ? '' : 'fab-idle'}
          style={{
            width: 60, height: 60, borderRadius: '50%',
            background: open
              ? 'rgba(255,255,255,0.22)'
              : 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: open ? '1.5px solid rgba(255,255,255,0.55)' : '1.5px solid rgba(255,255,255,0.35)',
            boxShadow: open ? '0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.5)' : undefined,
            transform: open ? 'scale(0.92)' : 'scale(1)',
            transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), background 0.35s ease, border-color 0.3s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', outline: 'none', pointerEvents: 'auto',
          }}
        >
          <div style={{ position: 'relative', width: 22, height: 22 }}>
            <Sparkles size={20} color="white" style={{
              position: 'absolute', inset: 0, margin: 'auto',
              opacity: open ? 0 : 1,
              transform: open ? 'scale(0) rotate(-90deg)' : 'scale(1) rotate(0deg)',
              transition: 'opacity 0.25s ease, transform 0.3s ease',
            }} />
            <X size={20} color="white" style={{
              position: 'absolute', inset: 0, margin: 'auto',
              opacity: open ? 1 : 0,
              transform: open ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(90deg)',
              transition: 'opacity 0.25s ease, transform 0.3s ease',
            }} />
          </div>
        </button>
      </div>
    </>
  )
}
