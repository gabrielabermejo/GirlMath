import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Home, LayoutDashboard, TrendingUp, TrendingDown,
  RepeatIcon, HandCoins, Landmark, Sparkles, X,
  ArrowUpDown, ShieldCheck, CalendarDays, PiggyBank, CreditCard,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/',             label: 'Inicio',      icon: Home,            color: '#f472b6', bg: 'rgba(253,242,248,0.94)' },
  { to: '/dashboard',    label: 'Dashboard',   icon: LayoutDashboard, color: '#c084fc', bg: 'rgba(250,245,255,0.94)' },
  { to: '/ingresos',     label: 'Ingresos',    icon: TrendingUp,      color: '#34d399', bg: 'rgba(240,253,244,0.94)' },
  { to: '/gastos',       label: 'Gastos',      icon: TrendingDown,    color: '#fb7185', bg: 'rgba(255,241,242,0.94)' },
  { to: '/gastos-fijos', label: 'Fijos',       icon: RepeatIcon,      color: '#a78bfa', bg: 'rgba(245,243,255,0.94)' },
  { to: '/prestamos',    label: 'Préstamos',   icon: HandCoins,       color: '#f59e0b', bg: 'rgba(255,251,235,0.94)' },
  { to: '/cuentas',      label: 'Cuentas',     icon: Landmark,        color: '#60a5fa', bg: 'rgba(239,246,255,0.94)' },
  { to: '/ahorro',       label: 'Ahorros',     icon: PiggyBank,       color: '#ec4899', bg: 'rgba(253,242,248,0.94)' },
  { to: '/deudas',       label: 'Deudas',      icon: CreditCard,      color: '#f43f5e', bg: 'rgba(255,241,242,0.94)' },
  { to: '/movimientos',  label: 'Movimientos', icon: ArrowUpDown,     color: '#f472b6', bg: 'rgba(253,242,248,0.94)' },
  { to: '/calendario',   label: 'Calendario',  icon: CalendarDays,    color: '#2dd4bf', bg: 'rgba(240,253,250,0.94)' },
]

const ITEM_W = 84   // horizontal px per step
const ROT    = 40   // degrees Y-rotation per step
const Z_RET  = 58   // px z-retreat per step

function Wheel({ allLinks, onClose }: { allLinks: typeof links; onClose: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()

  const initIdx = Math.max(0, allLinks.findIndex(l =>
    l.to === '/' ? location.pathname === '/' : location.pathname.startsWith(l.to)
  ))

  const [snap, setSnap] = useState(initIdx)
  const [drag, setDrag] = useState(0)
  const [moving, setMoving] = useState(false)

  const startX    = useRef(0)
  const hasDragged = useRef(false)

  const float = snap + drag

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    hasDragged.current = false
    setMoving(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = startX.current - e.touches[0].clientX
    if (Math.abs(dx) > 6) hasDragged.current = true
    setDrag(dx / ITEM_W)
  }

  function onTouchEnd() {
    const next = Math.max(0, Math.min(allLinks.length - 1, Math.round(snap + drag)))
    setMoving(false)
    setSnap(next)
    setDrag(0)
  }

  return (
    <div style={{ padding: '18px 0 12px', touchAction: 'none', userSelect: 'none' }}>
      {/* Wheel track */}
      <div
        style={{ position: 'relative', height: 108 }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div style={{ position: 'absolute', inset: 0, perspective: 580 }}>
          {allLinks.map((link, i) => {
            const off    = i - float
            const abs    = Math.abs(off)
            const scale   = Math.max(0.44, 1 - abs * 0.16)
            const opacity = Math.max(0, 1 - abs * 0.27)
            const isCenter = abs < 0.5

            return (
              <button
                key={link.to}
                onClick={() => {
                  if (!hasDragged.current) { navigate(link.to); onClose() }
                }}
                style={{
                  position: 'absolute',
                  left: '50%', top: '50%',
                  width: 68, height: 86,
                  marginLeft: -34, marginTop: -43,
                  borderRadius: 18,
                  background: link.bg,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: `${isCenter ? 2 : 1.5}px solid ${link.color}${isCenter ? '66' : '22'}`,
                  boxShadow: isCenter
                    ? `0 8px 28px ${link.color}44, inset 0 1px 0 rgba(255,255,255,0.85)`
                    : '0 2px 8px rgba(0,0,0,0.06)',
                  transform: `translateX(${off * ITEM_W}px) rotateY(${-off * ROT}deg) translateZ(${-abs * Z_RET}px) scale(${scale})`,
                  opacity,
                  transition: moving
                    ? 'none'
                    : 'transform 0.44s cubic-bezier(0.34,1.3,0.64,1), opacity 0.32s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 7,
                  cursor: 'pointer', outline: 'none',
                  zIndex: Math.round(scale * 10),
                  pointerEvents: opacity > 0.12 ? 'auto' : 'none',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: `linear-gradient(135deg, ${link.color}${isCenter ? '38' : '1c'} 0%, ${link.color}${isCenter ? '55' : '2e'} 100%)`,
                  border: `1px solid ${link.color}38`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isCenter ? `0 4px 14px ${link.color}32` : 'none',
                  transition: 'background 0.3s ease, box-shadow 0.3s ease',
                }}>
                  <link.icon size={18} style={{ color: link.color }} />
                </div>
                <span style={{
                  fontSize: 9.5,
                  fontWeight: isCenter ? 700 : 600,
                  color: isCenter ? link.color : '#9ca3af',
                  maxWidth: 62, overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  transition: 'color 0.3s ease',
                }}>
                  {link.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 10 }}>
        {allLinks.map((_, i) => (
          <div
            key={i}
            onClick={() => { setSnap(i); setDrag(0) }}
            style={{
              width: i === snap ? 18 : 5,
              height: 5, borderRadius: 3,
              background: i === snap ? allLinks[snap].color : 'rgba(0,0,0,0.12)',
              transition: 'width 0.35s cubic-bezier(0.34,1.3,0.64,1), background 0.3s ease',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { profile } = useAuth()

  const allLinks = [
    ...links,
    ...(profile?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck, color: '#a78bfa', bg: 'rgba(245,243,255,0.94)' }]
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
        @keyframes drawer-up {
          from { opacity: 0; transform: translateY(22px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .drawer-up { animation: drawer-up 0.38s cubic-bezier(0.34,1.3,0.64,1) both; }
      `}</style>

      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-40"
        style={{
          background: 'rgba(0,0,0,0.42)',
          backdropFilter: open ? 'blur(10px)' : 'blur(0px)',
          WebkitBackdropFilter: open ? 'blur(10px)' : 'blur(0px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.28s ease, backdrop-filter 0.28s ease',
        }}
        onClick={() => setOpen(false)}
      />

      {/* Glass bottom strip */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-50"
        style={{
          height: 'calc(76px + max(env(safe-area-inset-bottom, 0px), 0px))',
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 -4px 24px rgba(236,72,153,0.06)',
          pointerEvents: 'none',
        }}
      />

      {/* Drawer */}
      {open && (
        <div
          className="drawer-up md:hidden fixed inset-x-0 z-50 flex justify-center px-4"
          style={{ bottom: 'calc(76px + max(env(safe-area-inset-bottom, 0px), 0px) + 12px)' }}
        >
          <div
            style={{
              width: '100%', maxWidth: 440,
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              borderRadius: 28,
              border: '1.5px solid rgba(255,255,255,0.92)',
              boxShadow: '0 16px 56px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
              padding: '4px 12px 8px',
              overflow: 'hidden',
            }}
          >
            <Wheel allLinks={allLinks} onClose={() => setOpen(false)} />
          </div>
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
