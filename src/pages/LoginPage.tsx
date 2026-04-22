import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, isDemo } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Sparkles, FlaskConical } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormValues = z.infer<typeof schema>

const DEMO_EMAIL = 'demo@budget.com'
const DEMO_PASSWORD = 'demo123'

export default function LoginPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const { error } = await supabase.auth.signInWithPassword(values)
    if (error) {
      toast.error('Credenciales incorrectas')
      return
    }
    navigate('/')
  }

  function fillDemo() {
    setValue('email', DEMO_EMAIL)
    setValue('password', DEMO_PASSWORD)
  }

  const stars = [
    { top: '8%',  left: '12%', size: 6,  delay: '0s',   dur: '2.2s' },
    { top: '15%', left: '80%', size: 4,  delay: '0.5s', dur: '3s'   },
    { top: '25%', left: '55%', size: 5,  delay: '1s',   dur: '2.5s' },
    { top: '40%', left: '8%',  size: 3,  delay: '1.8s', dur: '2s'   },
    { top: '60%', left: '90%', size: 6,  delay: '0.3s', dur: '2.8s' },
    { top: '70%', left: '40%', size: 4,  delay: '2s',   dur: '3.2s' },
    { top: '80%', left: '18%', size: 5,  delay: '0.7s', dur: '2.4s' },
    { top: '88%', left: '70%', size: 3,  delay: '1.3s', dur: '2.1s' },
    { top: '5%',  left: '45%', size: 4,  delay: '2.5s', dur: '2.7s' },
    { top: '50%', left: '25%', size: 5,  delay: '0.9s', dur: '3.1s' },
    { top: '35%', left: '95%', size: 3,  delay: '1.6s', dur: '2.3s' },
    { top: '92%', left: '50%', size: 6,  delay: '0.2s', dur: '2.9s' },
  ]

  const bubbles = [
    { size: 60,  left: '10%', delay: '0s',    duration: '8s'  },
    { size: 90,  left: '20%', delay: '1.5s',  duration: '11s' },
    { size: 40,  left: '35%', delay: '3s',    duration: '9s'  },
    { size: 70,  left: '50%', delay: '0.8s',  duration: '13s' },
    { size: 50,  left: '65%', delay: '2.2s',  duration: '10s' },
    { size: 100, left: '75%', delay: '4s',    duration: '14s' },
    { size: 35,  left: '85%', delay: '1s',    duration: '7s'  },
    { size: 80,  left: '92%', delay: '3.5s',  duration: '12s' },
  ]

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fce7f3 0%, #fdf2f8 40%, #f3e8ff 100%)',
      }}
    >
      <style>{`
        @keyframes bubble-rise {
          0%   { transform: translateY(0) scale(1);   opacity: 0.5; }
          50%  { transform: translateY(-45vh) scale(1.05); opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(0.9); opacity: 0; }
        }
        @keyframes float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>

      {/* Estrellitas */}
      {stars.map((s, i) => (
        <span key={i} style={{
          position: 'absolute',
          top: s.top,
          left: s.left,
          width: s.size,
          height: s.size,
          pointerEvents: 'none',
          animation: `twinkle ${s.dur} ${s.delay} ease-in-out infinite`,
        }}>
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z" fill="rgba(236,72,153,0.7)" />
          </svg>
        </span>
      ))}

      {/* Blobs de color para que el vidrio se note */}
      <div style={{ position: 'absolute', top: '10%',  left: '5%',  width: 320, height: 320, borderRadius: '50%', background: 'rgba(244,114,182,0.35)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%',  right: '5%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(192,132,252,0.35)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '5%',left: '30%', width: 260, height: 260, borderRadius: '50%', background: 'rgba(251,113,133,0.25)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      {bubbles.map((b, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            bottom: '-120px',
            left: b.left,
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), rgba(249,168,212,0.25))',
            border: '1.5px solid rgba(249,168,212,0.4)',
            backdropFilter: 'blur(2px)',
            animation: `bubble-rise ${b.duration} ${b.delay} infinite ease-in`,
            pointerEvents: 'none',
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 shadow-lg shadow-pink-200">
            <Sparkles size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
              GirlMath <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>🎀</span>
            </h1>
            <p className="text-sm text-pink-400 mt-1">Tu presupuesto personal ✨</p>
          </div>
        </div>

        <div className="rounded-2xl p-8"
          style={{
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1.5px solid rgba(255, 255, 255, 0.55)',
            boxShadow: '0 20px 60px rgba(236, 72, 153, 0.2), 0 4px 16px rgba(192,132,252,0.15), inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          {isDemo && (
            <div className="mb-5 rounded-xl border border-pink-200 bg-pink-50 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-pink-600">
                <FlaskConical size={13} />
                Modo demo — sin Supabase real
              </div>
              <p className="mb-2 text-xs text-pink-500">
                Los datos se guardan en <strong>localStorage</strong>.
              </p>
              <div className="mb-2 rounded-lg bg-white px-2 py-1.5 font-mono text-xs text-pink-700 border border-pink-100">
                <span className="text-pink-400">email</span> {DEMO_EMAIL}<br />
                <span className="text-pink-400">pass&nbsp;&nbsp;</span> {DEMO_PASSWORD}
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="w-full rounded-lg bg-pink-500 py-1.5 text-xs font-medium text-white hover:bg-pink-600 transition"
              >
                Usar credenciales demo
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="tu@email.com"
                {...register('email')}
              />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando...' : 'Iniciar sesión ✨'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold text-pink-500 hover:text-pink-600 hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

