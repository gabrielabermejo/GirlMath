import { useEffect, useState } from 'react'
import { UserCheck, UserX, Users, Sparkles, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface UserRow {
  id: string
  full_name: string
  email: string | null
  status: 'pending' | 'active'
  role: 'user' | 'admin'
  created_at: string
}

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
function fmtDate(d: string) {
  const dt = new Date(d)
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`
}

export default function AdminPage() {
  const { profile } = useAuth()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'active'>('pending')

  if (profile && profile.role !== 'admin') return <Navigate to="/" replace />

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, status, role, created_at')
      .order('created_at', { ascending: false })
    if (!error && data) setUsers(data as UserRow[])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  async function activate(userId: string) {
    setActivating(userId)
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', userId)
    if (error) {
      toast.error('Error al activar')
    } else {
      toast.success('Usuario activado ✓')
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: 'active' } : u))
    }
    setActivating(null)
  }

  async function deactivate(userId: string) {
    setActivating(userId)
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'pending' })
      .eq('id', userId)
    if (error) {
      toast.error('Error')
    } else {
      toast.success('Usuario desactivado')
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, status: 'pending' } : u))
    }
    setActivating(null)
  }

  const pending = users.filter((u) => u.status === 'pending' && u.role !== 'admin')
  const active  = users.filter((u) => u.status === 'active'  && u.role !== 'admin')
  const visible = tab === 'pending' ? pending : active

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6 pb-32 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Sparkles size={18} className="text-pink-400" />
            Panel de admin
          </h1>
          <p className="text-sm text-pink-400">Gestiona los usuarios registrados</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-pink-50 transition"
        >
          <RefreshCw size={16} className={`text-pink-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-amber-500">{pending.length}</p>
        </div>
        <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Activos</p>
          <p className="text-2xl font-bold text-green-500">{active.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['pending', 'active'] as const).map((t) => {
          const labels = { pending: 'Pendientes', active: 'Activos' }
          const isActive = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-xl px-4 py-1.5 text-sm font-semibold transition"
              style={{
                background: isActive
                  ? t === 'pending' ? '#fef3c7' : '#dcfce7'
                  : '#f9fafb',
                color: isActive
                  ? t === 'pending' ? '#d97706' : '#16a34a'
                  : '#9ca3af',
                border: isActive ? 'none' : '1px solid #f3f4f6',
              }}
            >
              {labels[t]} {t === 'pending' && pending.length > 0 && (
                <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] text-white font-bold">
                  {pending.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* User list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-gray-300">
          <Users size={40} />
          <p className="text-sm">
            {tab === 'pending' ? 'No hay usuarios pendientes' : 'No hay usuarios activos'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-2xl bg-white border border-pink-50 px-4 py-3 shadow-sm"
            >
              {/* Avatar */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #f9a8d4, #c084fc)' }}
              >
                {u.full_name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{u.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{u.email ?? 'Sin email'}</p>
                <p className="text-xs text-gray-300">{fmtDate(u.created_at)}</p>
              </div>

              {/* Action */}
              {tab === 'pending' ? (
                <button
                  onClick={() => activate(u.id)}
                  disabled={activating === u.id}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50 shrink-0"
                  style={{ background: 'linear-gradient(135deg, #34d399, #10b981)' }}
                >
                  <UserCheck size={13} />
                  {activating === u.id ? '...' : 'Activar'}
                </button>
              ) : (
                <button
                  onClick={() => deactivate(u.id)}
                  disabled={activating === u.id}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50 shrink-0"
                  style={{ background: 'linear-gradient(135deg, #c084fc, #a855f7)' }}
                >
                  <UserX size={13} />
                  {activating === u.id ? '...' : 'Desactivar'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
