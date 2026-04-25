import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Clock, RefreshCw, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function PendingPage() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(false)

  async function checkActivation() {
    if (!user) return
    setChecking(true)
    const { data } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single()
    setChecking(false)
    if (data?.status === 'active') {
      navigate('/', { replace: true })
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fdf2f8 40%, #f3e8ff 100%)' }}
    >
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes sparkle-pop {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
          50%       { opacity: 1;   transform: scale(1.3) rotate(25deg); }
        }
        .float-slow    { animation: float-slow 3.5s ease-in-out infinite; }
        .sparkle-anim  { animation: sparkle-pop ease-in-out infinite; }
      `}</style>

      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div className="float-slow flex justify-center mb-6">
          <div
            className="relative flex h-24 w-24 items-center justify-center rounded-3xl shadow-xl shadow-pink-200"
            style={{ background: 'linear-gradient(135deg, #f9a8d4, #c084fc)' }}
          >
            <Clock size={44} className="text-white" />
            {[
              { top: '-8px', right: '-8px',  size: 14, delay: '0s',   dur: '2s'   },
              { top: '-4px', left: '-10px',  size: 10, delay: '0.7s', dur: '1.8s' },
              { bottom: '-6px', right: '-4px', size: 12, delay: '1.2s', dur: '2.3s' },
            ].map((s, i) => (
              <Sparkles
                key={i}
                size={s.size}
                className="sparkle-anim absolute text-yellow-300"
                style={{ top: s.top, right: s.right, left: s.left, bottom: s.bottom, animationDelay: s.delay, animationDuration: s.dur }}
              />
            ))}
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Cuenta pendiente ✨
        </h1>
        <p className="text-gray-500 text-sm mb-1">
          Hola <span className="font-semibold text-pink-500">{profile?.full_name ?? 'amiga'}</span> 👋
        </p>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Tu cuenta está esperando ser activada por un administrador. Te avisaremos cuando esté lista.
        </p>

        {/* Card */}
        <div
          className="rounded-3xl p-6 mb-6 shadow-sm"
          style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(249,168,212,0.3)' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-semibold text-amber-600">Pendiente por activar</span>
          </div>
          <p className="text-xs text-gray-400 text-left leading-relaxed">
            Una vez que el administrador active tu cuenta, podrás acceder a todos los módulos de GirlMath.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={checkActivation}
            disabled={checking}
            className="flex items-center justify-center gap-2 w-full rounded-2xl py-3 text-sm font-semibold text-white shadow-md transition disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Verificando...' : 'Ya me activaron — verificar'}
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full rounded-2xl py-3 text-sm font-medium text-pink-400 hover:text-pink-500 transition"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
