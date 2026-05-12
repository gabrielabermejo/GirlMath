import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home, LayoutDashboard, TrendingUp, TrendingDown,
  RepeatIcon, HandCoins, Landmark, Sparkles, X,
  ArrowUpDown, ShieldCheck, CalendarDays, PiggyBank, CreditCard,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/',              label: 'Inicio',      icon: Home,            color: '#f472b6', bg: 'rgba(253,242,248,0.94)' },
  { to: '/dashboard',     label: 'Dashboard',   icon: LayoutDashboard, color: '#c084fc', bg: 'rgba(250,245,255,0.94)' },
  { to: '/ingresos',      label: 'Ingresos',    icon: TrendingUp,      color: '#34d399', bg: 'rgba(240,253,244,0.94)' },
  { to: '/gastos',        label: 'Gastos',      icon: TrendingDown,    color: '#fb7185', bg: 'rgba(255,241,242,0.94)' },
  { to: '/gastos-fijos',  label: 'Fijos',       icon: RepeatIcon,      color: '#a78bfa', bg: 'rgba(245,243,255,0.94)' },
  { to: '/prestamos',     label: 'Préstamos',   icon: HandCoins,       color: '#f59e0b', bg: 'rgba(255,251,235,0.94)' },
  { to: '/cuentas',       label: 'Cuentas',     icon: Landmark,        color: '#60a5fa', bg: 'rgba(239,246,255,0.94)' },
  { to: '/ahorro',        label: 'Ahorros',     icon: PiggyBank,       color: '#ec4899', bg: 'rgba(253,242,248,0.94)' },
  { to: '/deudas',        label: 'Deudas',      icon: CreditCard,      color: '#f43f5e', bg: 'rgba(255,241,242,0.94)' },
  { to: '/movimientos',   label: 'Movimientos', icon: ArrowUpDown,     color: '#f472b6', bg: 'rgba(253,242,248,0.94)' },
  { to: '/calendario',    label: 'Calendario',  icon: CalendarDays,    color: '#2dd4bf', bg: 'rgba(240,253,250,0.94)' },
]

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
          0%, 100% { box-shadow: 0 8px 28px rgba(236,72,153,0.5), 0 0 0 0   rgba(236,72,153,0.25); }
          50%       { box-shadow: 0 8px 28px rgba(236,72,153,0.5), 0 0 0 10px rgba(236,72,153,0.0); }
        }
        .fab-idle { animation: fab-pulse 2.8s ease-in-out infinite; }

        @keyframes drawer-in {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes drawer-out {
          from { opacity: 1; transform: translateY(0)    scale(1); }
          to   { opacity: 0; transform: translateY(24px) scale(0.96); }
        }
        .drawer-open  { animation: drawer-in  0.38s cubic-bezier(0.34,1.3,0.64,1) both; }
        .drawer-close { animation: drawer-out 0.22s cubic-bezier(0.55,0,1,0.45)   both; }

        @keyframes chip-pop {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-40"
        style={{
          background: 'rgba(0,0,0,0.4)',
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

      {/* Drawer panel */}
      {open && (
        <div
          className="drawer-open md:hidden fixed inset-x-0 z-50 flex justify-center px-4"
          style={{
            bottom: 'calc(76px + max(env(safe-area-inset-bottom, 0px), 0px) + 12px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'rgba(255,255,255,0.78)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              borderRadius: 28,
              border: '1.5px solid rgba(255,255,255,0.92)',
              boxShadow: '0 16px 56px rgba(0,0,0,0.18), 0 2px 0 rgba(255,255,255,0.9) inset',
              padding: '20px 16px 16px',
            }}
          >
            {/* Grid of chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {allLinks.map((link, i) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  style={{ textDecoration: 'none' }}
                >
                  {({ isActive }) => (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        padding: '14px 8px 10px',
                        borderRadius: 18,
                        background: isActive ? link.bg : 'rgba(255,255,255,0.65)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: `1.5px solid ${isActive ? link.color + '55' : 'rgba(255,255,255,0.8)'}`,
                        boxShadow: isActive
                          ? `0 4px 18px ${link.color}35, inset 0 1px 0 rgba(255,255,255,0.9)`
                          : '0 2px 10px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
                        animation: `chip-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) ${i * 30}ms both`,
                        cursor: 'pointer',
                        transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: isActive
                            ? `linear-gradient(135deg, ${link.color}30 0%, ${link.color}50 100%)`
                            : `linear-gradient(135deg, ${link.color}18 0%, ${link.color}28 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${link.color}35`,
                          boxShadow: isActive ? `0 3px 12px ${link.color}30` : 'none',
                          transition: 'background 0.2s ease, box-shadow 0.2s ease',
                        }}
                      >
                        <link.icon size={18} style={{ color: link.color }} />
                      </div>
                      <span style={{
                        fontSize: 10,
                        fontWeight: isActive ? 700 : 600,
                        color: isActive ? link.color : '#6b7280',
                        textAlign: 'center',
                        lineHeight: 1.2,
                        transition: 'color 0.2s ease',
                      }}>
                        {link.label}
                      </span>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
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
                position: 'absolute', inset: 0, margin: 'auto',
                opacity: open ? 0 : 1,
                transform: open ? 'scale(0) rotate(-90deg)' : 'scale(1) rotate(0deg)',
                transition: 'opacity 0.25s ease, transform 0.3s ease',
              }}
            />
            <X
              size={20}
              color="white"
              style={{
                position: 'absolute', inset: 0, margin: 'auto',
                opacity: open ? 1 : 0,
                transform: open ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(90deg)',
                transition: 'opacity 0.25s ease, transform 0.3s ease',
              }}
            />
          </div>
        </button>
      </div>
    </>
  )
}
