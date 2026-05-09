import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, LayoutDashboard, TrendingUp, TrendingDown,
  RepeatIcon, HandCoins, Landmark, Sparkles, X,
  ArrowUpDown, ShieldCheck, CalendarDays,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/',              label: 'Inicio',       icon: Home,            end: true,  color: '#f472b6', bg: 'rgba(253,242,248,0.95)' },
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, end: true,  color: '#c084fc', bg: 'rgba(250,245,255,0.95)' },
  { to: '/ingresos',     label: 'Ingresos',     icon: TrendingUp,      end: false, color: '#34d399', bg: 'rgba(240,253,244,0.95)' },
  { to: '/gastos',       label: 'Gastos',       icon: TrendingDown,    end: false, color: '#fb7185', bg: 'rgba(255,241,242,0.95)' },
  { to: '/gastos-fijos', label: 'Fijos',        icon: RepeatIcon,      end: false, color: '#a78bfa', bg: 'rgba(245,243,255,0.95)' },
  { to: '/prestamos',    label: 'Préstamos',    icon: HandCoins,       end: false, color: '#f59e0b', bg: 'rgba(255,251,235,0.95)' },
  { to: '/cuentas',      label: 'Cuentas',      icon: Landmark,        end: false, color: '#60a5fa', bg: 'rgba(239,246,255,0.95)' },
  { to: '/movimientos',  label: 'Movimientos',  icon: ArrowUpDown,     end: false, color: '#f472b6', bg: 'rgba(253,242,248,0.95)' },
  { to: '/calendario',   label: 'Calendario',   icon: CalendarDays,    end: false, color: '#2dd4bf', bg: 'rgba(240,253,250,0.95)' },
]

// Two-ring layout — avoids crowding when labels are long:
//   Ring 1 (inner, indices 0-4): radius 115px, 40° apart → ~80px arc gap ✓
//   Ring 2 (outer, indices 5-8): radius 170px, 40° apart → ~118px arc gap ✓
//   Ring 2 angles are offset 20° from ring 1, filling the visual gaps (flower pattern)
// A 10th item (admin) sits at the top of the outer ring (90°).
const deg = (a: number) => (a * Math.PI) / 180
const pos = (r: number, a: number) => ({
  tx: Math.round(r * Math.cos(deg(a))),
  ty: Math.round(-r * Math.sin(deg(a))),
})

const RING1_ANGLES = [170, 130, 90, 50, 10]   // 5 inner slots
const RING2_ANGLES = [150, 110, 70, 30]        // 4 outer slots (fills ring-1 gaps)
const ADMIN_POS    = pos(170, 90)              // top of outer ring

const POSITIONS = [
  ...RING1_ANGLES.map(a => pos(115, a)),
  ...RING2_ANGLES.map(a => pos(170, a)),
  ADMIN_POS,
]

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const { profile } = useAuth()

  const allLinks = [
    ...links,
    ...(profile?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck, end: false, color: '#a78bfa', bg: 'rgba(245,243,255,0.95)' }]
      : []),
  ]

  return (
    <>
      <style>{`
        @keyframes fab-pulse {
          0%, 100% { box-shadow: 0 8px 28px rgba(236,72,153,0.5), 0 0 0 0 rgba(236,72,153,0.25); }
          50%       { box-shadow: 0 8px 28px rgba(236,72,153,0.5), 0 0 0 10px rgba(236,72,153,0.0); }
        }
        .fab-idle { animation: fab-pulse 2.8s ease-in-out infinite; }
      `}</style>

      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-40"
        style={{
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: open ? 'blur(10px)' : 'blur(0px)',
          WebkitBackdropFilter: open ? 'blur(10px)' : 'blur(0px)',
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
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255,255,255,0.9)',
          boxShadow: '0 -4px 24px rgba(236,72,153,0.06)',
          pointerEvents: 'none',
        }}
      />

      {/* FAB + radial items */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex justify-center"
        style={{
          paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 8px), 16px)',
          paddingTop: 8,
          pointerEvents: 'none',
        }}
      >
        {/* 60×60 anchor — top:50%/left:50% on children maps to button center */}
        <div style={{ position: 'relative', width: 60, height: 60 }}>

          {/* ── Radial items ── */}
          {allLinks.map((link, i) => {
            const { tx, ty } = POSITIONS[i] ?? pos(115, 90)

            // Ring 1 (0-4) opens first, ring 2 (5+) follows 60ms later
            const ring2 = i >= 5
            const openDelay  = ring2 ? 60 + (i - 5) * 38 : i * 38
            const closeDelay = ring2 ? (allLinks.length - 1 - i) * 22 : 60 + (4 - i) * 22

            return (
              <div
                key={link.to}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: open
                    ? `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1)`
                    : 'translate(-50%, -50%) scale(0)',
                  opacity: open ? 1 : 0,
                  transition: open
                    ? `transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${openDelay}ms, opacity 0.28s ease ${openDelay * 0.5}ms`
                    : `transform 0.28s cubic-bezier(0.55,0,1,0.45) ${closeDelay}ms, opacity 0.18s ease ${closeDelay}ms`,
                  pointerEvents: open ? 'auto' : 'none',
                  zIndex: 51,
                }}
              >
                <NavLink to={link.to} end={link.end} onClick={() => setOpen(false)}>
                  {({ isActive }) => (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, userSelect: 'none' }}>

                      {/* Glass circle */}
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          background: isActive ? link.bg : 'rgba(255,255,255,0.82)',
                          backdropFilter: 'blur(20px)',
                          WebkitBackdropFilter: 'blur(20px)',
                          border: `1.5px solid ${isActive ? link.color + '90' : 'rgba(255,255,255,0.75)'}`,
                          boxShadow: isActive
                            ? `0 4px 20px ${link.color}45, inset 0 1px 0 rgba(255,255,255,0.9)`
                            : '0 4px 18px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <link.icon size={19} style={{ color: isActive ? link.color : '#6b7280' }} />
                      </div>

                      {/* Label */}
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: 'white',
                          textShadow: '0 1px 6px rgba(0,0,0,0.55)',
                          whiteSpace: 'nowrap',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {link.label}
                      </span>
                    </div>
                  )}
                </NavLink>
              </div>
            )
          })}

          {/* ── Center FAB ── */}
          <button
            onClick={() => setOpen(o => !o)}
            className={open ? '' : 'fab-idle'}
            style={{
              position: 'relative',
              zIndex: 52,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: open
                ? 'rgba(255,255,255,0.22)'
                : 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: open
                ? '1.5px solid rgba(255,255,255,0.55)'
                : '1.5px solid rgba(255,255,255,0.35)',
              boxShadow: open
                ? '0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.5)'
                : undefined,
              transform: open ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), background 0.35s ease, border-color 0.3s ease, box-shadow 0.35s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              pointerEvents: 'auto',
            }}
          >
            <div style={{ position: 'relative', width: 22, height: 22 }}>
              <Sparkles
                size={20}
                color="white"
                style={{
                  position: 'absolute',
                  inset: 0,
                  margin: 'auto',
                  opacity: open ? 0 : 1,
                  transform: open ? 'scale(0) rotate(-90deg)' : 'scale(1) rotate(0deg)',
                  transition: 'opacity 0.25s ease, transform 0.3s ease',
                }}
              />
              <X
                size={20}
                color="white"
                style={{
                  position: 'absolute',
                  inset: 0,
                  margin: 'auto',
                  opacity: open ? 1 : 0,
                  transform: open ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(90deg)',
                  transition: 'opacity 0.25s ease, transform 0.3s ease',
                }}
              />
            </div>
          </button>
        </div>
      </div>
    </>
  )
}
