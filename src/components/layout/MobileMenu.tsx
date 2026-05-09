import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, LayoutDashboard, TrendingUp, TrendingDown,
  RepeatIcon, HandCoins, Landmark, Sparkles, X,
  ArrowUpDown, ShieldCheck, CalendarDays, PiggyBank,
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
  { to: '/ahorro',       label: 'Ahorros',      icon: PiggyBank,       end: false, color: '#ec4899', bg: 'rgba(253,242,248,0.95)' },
  { to: '/movimientos',  label: 'Movimientos',  icon: ArrowUpDown,     end: false, color: '#f472b6', bg: 'rgba(253,242,248,0.95)' },
  { to: '/calendario',   label: 'Calendario',   icon: CalendarDays,    end: false, color: '#2dd4bf', bg: 'rgba(240,253,250,0.95)' },
]

// Vertical spacing between item centers (px)
const STEP = 62

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

      {/* FAB + vertical items */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-50 flex justify-center"
        style={{
          paddingBottom: 'max(calc(env(safe-area-inset-bottom, 0px) + 8px), 16px)',
          paddingTop: 8,
          pointerEvents: 'none',
        }}
      >
        {/* 60×60 anchor — items are positioned relative to button center */}
        <div style={{ position: 'relative', width: 60, height: 60 }}>

          {/* ── Vertical column items (bottom = index 0, top = last) ── */}
          {allLinks.map((link, i) => {
            const ty = -STEP * (i + 1)   // straight up, evenly spaced
            const openDelay  = i * 38             // bottom item first
            const closeDelay = (allLinks.length - 1 - i) * 28  // top item closes first

            return (
              <div
                key={link.to}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: open
                    ? `translate(-50%, calc(-50% + ${ty}px)) scale(1)`
                    : 'translate(-50%, -50%) scale(0)',
                  opacity: open ? 1 : 0,
                  transition: open
                    ? `transform 0.52s cubic-bezier(0.34,1.56,0.64,1) ${openDelay}ms, opacity 0.25s ease ${openDelay * 0.5}ms`
                    : `transform 0.26s cubic-bezier(0.55,0,1,0.45) ${closeDelay}ms, opacity 0.18s ease ${closeDelay}ms`,
                  pointerEvents: open ? 'auto' : 'none',
                  zIndex: 51,
                }}
              >
                <NavLink to={link.to} end={link.end} onClick={() => setOpen(false)}>
                  {({ isActive }) => (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}>
                      {/* Glass circle */}
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          flexShrink: 0,
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
                        <link.icon size={18} style={{ color: isActive ? link.color : '#6b7280' }} />
                      </div>

                      {/* Label to the right of circle */}
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'white',
                          textShadow: '0 1px 8px rgba(0,0,0,0.6)',
                          letterSpacing: '0.01em',
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
