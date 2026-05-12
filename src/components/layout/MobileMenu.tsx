import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home, LayoutDashboard, TrendingUp, TrendingDown,
  RepeatIcon, HandCoins, Landmark, Sparkles, X,
  ArrowUpDown, ShieldCheck, CalendarDays, PiggyBank, CreditCard,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/',             label: 'Inicio',      icon: Home,            color: '#f472b6', bg: 'rgba(253,242,248,0.96)' },
  { to: '/dashboard',    label: 'Dashboard',   icon: LayoutDashboard, color: '#c084fc', bg: 'rgba(250,245,255,0.96)' },
  { to: '/ingresos',     label: 'Ingresos',    icon: TrendingUp,      color: '#34d399', bg: 'rgba(240,253,244,0.96)' },
  { to: '/gastos',       label: 'Gastos',      icon: TrendingDown,    color: '#fb7185', bg: 'rgba(255,241,242,0.96)' },
  { to: '/gastos-fijos', label: 'Fijos',       icon: RepeatIcon,      color: '#a78bfa', bg: 'rgba(245,243,255,0.96)' },
  { to: '/prestamos',    label: 'Préstamos',   icon: HandCoins,       color: '#f59e0b', bg: 'rgba(255,251,235,0.96)' },
  { to: '/cuentas',      label: 'Cuentas',     icon: Landmark,        color: '#60a5fa', bg: 'rgba(239,246,255,0.96)' },
  { to: '/ahorro',       label: 'Ahorros',     icon: PiggyBank,       color: '#ec4899', bg: 'rgba(253,242,248,0.96)' },
  { to: '/deudas',       label: 'Deudas',      icon: CreditCard,      color: '#f43f5e', bg: 'rgba(255,241,242,0.96)' },
  { to: '/movimientos',  label: 'Movimientos', icon: ArrowUpDown,     color: '#f472b6', bg: 'rgba(253,242,248,0.96)' },
  { to: '/calendario',   label: 'Calendario',  icon: CalendarDays,    color: '#2dd4bf', bg: 'rgba(240,253,250,0.96)' },
]

// Arc carousel constants
const ITEM_W    = 74    // chip width
const ITEM_H    = 88    // chip height
const STEP      = 84    // horizontal px per item slot (visual spacing)
const DRAG_PX   = 48    // px of finger movement = 1 item (sensitivity)
const Y_CURVE   = 5     // parabolic arc coefficient (px per dist²)
const MAX_SCALE = 1.0   // center scale
const MIN_SCALE = 0.56  // far items scale
const SCALE_K   = 0.13  // scale drop per item unit away

function arcScale(dist: number) {
  return Math.max(MIN_SCALE, MAX_SCALE - Math.abs(dist) * SCALE_K)
}
function arcY(dist: number) {
  return dist * dist * Y_CURVE
}
function arcOpacity(dist: number) {
  return Math.max(0, 1 - Math.abs(dist) * 0.24)
}

function ArcCarousel({ allLinks, onClose }: { allLinks: typeof links; onClose: () => void }) {
  const navigate  = useNavigate()
  const location  = useLocation()

  const initIdx = Math.max(0, allLinks.findIndex(l =>
    l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to)
  ))

  const [snap,       setSnap]       = useState(initIdx)
  const [drag,       setDrag]       = useState(0)
  const [isSwiping,  setIsSwiping]  = useState(false)

  const startX     = useRef(0)
  const hasMoved   = useRef(false)
  // Velocity tracking: store last 80ms of moves
  const velBuf     = useRef<{ x: number; t: number }[]>([])

  const floatIdx = snap + drag
  const containerH = ITEM_H + Math.pow(3, 2) * Y_CURVE + 24

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    hasMoved.current = false
    velBuf.current = [{ x: e.touches[0].clientX, t: performance.now() }]
    setIsSwiping(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    const cx = e.touches[0].clientX
    const dx = startX.current - cx
    if (Math.abs(dx) > 6) hasMoved.current = true
    // Update velocity buffer (keep last 80ms)
    const now = performance.now()
    velBuf.current.push({ x: cx, t: now })
    velBuf.current = velBuf.current.filter(p => now - p.t < 80)
    setDrag(dx / DRAG_PX)
  }

  function onTouchEnd() {
    // Compute velocity from recent samples (px/ms)
    const buf = velBuf.current
    let momentum = 0
    if (buf.length >= 2) {
      const first = buf[0]
      const last  = buf[buf.length - 1]
      const dt    = last.t - first.t
      if (dt > 0) {
        const velPxMs = (first.x - last.x) / dt   // px/ms
        momentum = velPxMs * 160 / DRAG_PX         // project 160ms forward in item units
      }
    }
    const raw  = snap + drag + momentum
    const next = Math.max(0, Math.min(allLinks.length - 1, Math.round(raw)))
    setIsSwiping(false)
    setSnap(next)
    setDrag(0)
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: containerH,
        overflow: 'visible',
        touchAction: 'none',
        userSelect: 'none',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {allLinks.map((link, i) => {
        const dist    = i - floatIdx
        const absDist = Math.abs(dist)
        const scale   = arcScale(dist)
        const ty      = arcY(dist)
        const opacity = arcOpacity(dist)
        const tx      = dist * STEP
        const isCenter = absDist < 0.45

        return (
          <button
            key={link.to}
            onClick={() => { if (!hasMoved.current) { navigate(link.to); onClose() } }}
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              width: ITEM_W,
              height: ITEM_H,
              marginLeft: -(ITEM_W / 2),
              borderRadius: 20,
              background: link.bg,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `${isCenter ? 2 : 1.5}px solid ${link.color}${isCenter ? '66' : '28'}`,
              boxShadow: isCenter
                ? `0 10px 32px ${link.color}48, inset 0 1px 0 rgba(255,255,255,0.9)`
                : `0 4px 14px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)`,
              transform: `translateX(${tx}px) translateY(${ty}px) scale(${scale})`,
              transformOrigin: 'center top',
              opacity,
              zIndex: Math.round(scale * 10),
              pointerEvents: opacity > 0.15 ? 'auto' : 'none',
              transition: isSwiping
                ? 'none'
                : 'transform 0.45s cubic-bezier(0.34,1.3,0.64,1), opacity 0.3s ease, box-shadow 0.35s ease, border-color 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {/* Icon box */}
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: `linear-gradient(135deg, ${link.color}${isCenter ? '3a' : '1e'} 0%, ${link.color}${isCenter ? '58' : '30'} 100%)`,
              border: `1px solid ${link.color}${isCenter ? '48' : '30'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isCenter ? `0 4px 14px ${link.color}38` : 'none',
              transition: 'background 0.3s ease, box-shadow 0.3s ease',
            }}>
              <link.icon size={18} style={{ color: link.color }} />
            </div>

            {/* Label */}
            <span style={{
              fontSize: 10,
              fontWeight: isCenter ? 700 : 600,
              color: isCenter ? link.color : '#6b7280',
              maxWidth: ITEM_W - 8,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textAlign: 'center',
              transition: 'color 0.3s ease',
            }}>
              {link.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { profile }     = useAuth()

  const allLinks = [
    ...links,
    ...(profile?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck, color: '#a78bfa', bg: 'rgba(245,243,255,0.96)' }]
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
        @keyframes arc-in {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .arc-in { animation: arc-in 0.38s cubic-bezier(0.34,1.3,0.64,1) both; }
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

      {/* Arc carousel — no box, chips float on backdrop */}
      {open && (
        <div
          className="arc-in md:hidden fixed inset-x-0 z-50"
          style={{
            bottom: 'calc(76px + max(env(safe-area-inset-bottom, 0px), 0px) + 16px)',
            padding: '0 20px',
          }}
        >
          <ArcCarousel allLinks={allLinks} onClose={() => setOpen(false)} />
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
