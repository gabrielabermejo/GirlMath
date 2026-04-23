import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Sparkles } from 'lucide-react'

const schema = z
  .object({
    full_name: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.full_name } },
    })
    if (error) {
      toast.error(error.message)
      return
    }
    if (data.session) {
      // Email confirmation is disabled — session ready immediately
      toast.success('¡Bienvenida! 🎀')
      navigate('/')
    } else {
      // Fallback: try signing in manually
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (signInError) {
        toast.error('Cuenta creada pero no se pudo iniciar sesión. Intenta de nuevo.')
        navigate('/login')
        return
      }
      toast.success('¡Bienvenida! 🎀')
      navigate('/')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #fce7f3 0%, #fdf2f8 40%, #f3e8ff 100%)',
      }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 shadow-lg shadow-pink-200">
            <Sparkles size={28} className="text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
              Crear cuenta
            </h1>
            <p className="text-sm text-pink-400 mt-1">Empieza a controlar tu presupuesto ✨</p>
          </div>
        </div>

        <div className="card p-8 border-pink-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Nombre completo</label>
              <input className="input" placeholder="Ana García" {...register('full_name')} />
              {errors.full_name && <p className="error-msg">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="tu@email.com" {...register('email')} />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input type="password" className="input" placeholder="••••••••" {...register('password')} />
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirmar contraseña</label>
              <input type="password" className="input" placeholder="••••••••" {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Creando cuenta...' : 'Crear mi cuenta ✨'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-semibold text-pink-500 hover:text-pink-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
