// localStorage-backed Supabase mock for demo mode.
// Activated when .env still has placeholder credentials.

const DEMO_ID = 'demo-user-id'
const DEMO_EMAIL = 'demo@budget.com'
const DEMO_PASSWORD = 'demo123'

type Row = Record<string, unknown>
type AuthCb = (event: string, session: MockSession | null) => void

interface MockSession {
  user: { id: string; email: string }
}

const listeners: AuthCb[] = []
let session: MockSession | null = JSON.parse(
  localStorage.getItem('_mock_session') ?? 'null',
)

function notify(event: string, s: MockSession | null) {
  listeners.forEach((cb) => cb(event, s))
}

function getRows(table: string): Row[] {
  return JSON.parse(localStorage.getItem(`_mock_${table}`) ?? '[]')
}

function setRows(table: string, rows: Row[]) {
  localStorage.setItem(`_mock_${table}`, JSON.stringify(rows))
}

function ensureDemoProfile() {
  const profiles = getRows('profiles')
  if (!profiles.find((p) => p.id === DEMO_ID)) {
    setRows('profiles', [
      ...profiles,
      { id: DEMO_ID, full_name: 'Usuario Demo', created_at: new Date().toISOString() },
    ])
  }
}

// ── QueryBuilder ──────────────────────────────────────────────────────────────

class QB {
  private _table: string
  private _op: 'select' | 'insert' | 'update' | 'delete' = 'select'
  private _filters: Array<[string, unknown]> = []
  private _orderCol = 'created_at'
  private _orderAsc = false
  private _payload: Row | null = null

  constructor(table: string) {
    this._table = table
  }

  select(_cols = '*') {
    this._op = 'select'
    return this
  }

  insert(payload: Row) {
    this._op = 'insert'
    this._payload = payload
    return this as unknown as Promise<{ data: Row | null; error: null }>
  }

  update(payload: Row) {
    this._op = 'update'
    this._payload = payload
    return this
  }

  delete() {
    this._op = 'delete'
    return this
  }

  eq(col: string, val: unknown) {
    this._filters.push([col, val])
    return this
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this._orderCol = col
    this._orderAsc = opts?.ascending ?? true
    return this
  }

  single(): Promise<{ data: Row | null; error: null }> {
    return this._run(true) as Promise<{ data: Row | null; error: null }>
  }

  then(
    resolve: (v: { data: unknown; error: null }) => unknown,
    reject?: (e: unknown) => unknown,
  ) {
    return this._run(false).then(resolve, reject)
  }

  private async _run(single: boolean): Promise<{ data: unknown; error: null }> {
    const rows = getRows(this._table)
    const match = (r: Row) => this._filters.every(([c, v]) => r[c] === v)

    if (this._op === 'select') {
      let res = rows.filter(match)
      res = res.sort((a, b) => {
        const av = String(a[this._orderCol] ?? '')
        const bv = String(b[this._orderCol] ?? '')
        return this._orderAsc ? av.localeCompare(bv) : bv.localeCompare(av)
      })
      return { data: single ? (res[0] ?? null) : res, error: null }
    }

    if (this._op === 'insert') {
      const row = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...this._payload }
      setRows(this._table, [...rows, row])
      return { data: row, error: null }
    }

    if (this._op === 'update') {
      setRows(this._table, rows.map((r) => (match(r) ? { ...r, ...this._payload } : r)))
      return { data: null, error: null }
    }

    if (this._op === 'delete') {
      setRows(this._table, rows.filter((r) => !match(r)))
      return { data: null, error: null }
    }

    return { data: null, error: null }
  }
}

// ── Mock client ───────────────────────────────────────────────────────────────

export const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session } }),

    onAuthStateChange: (cb: AuthCb) => {
      listeners.push(cb)
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              const i = listeners.indexOf(cb)
              if (i !== -1) listeners.splice(i, 1)
            },
          },
        },
      }
    },

    signInWithPassword: async ({
      email,
      password,
    }: {
      email: string
      password: string
    }) => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        session = { user: { id: DEMO_ID, email: DEMO_EMAIL } }
        localStorage.setItem('_mock_session', JSON.stringify(session))
        ensureDemoProfile()
        notify('SIGNED_IN', session)
        return { data: { session }, error: null }
      }
      return { data: { session: null }, error: { message: 'Credenciales incorrectas' } }
    },

    signUp: async ({
      email,
      password: _password,
      options,
    }: {
      email: string
      password: string
      options?: { data?: { full_name?: string } }
    }) => {
      const userId = crypto.randomUUID()
      session = { user: { id: userId, email } }
      localStorage.setItem('_mock_session', JSON.stringify(session))
      const profiles = getRows('profiles')
      setRows('profiles', [
        ...profiles,
        {
          id: userId,
          full_name: options?.data?.full_name ?? email.split('@')[0],
          created_at: new Date().toISOString(),
        },
      ])
      notify('SIGNED_IN', session)
      return { data: { session }, error: null }
    },

    signOut: async () => {
      session = null
      localStorage.removeItem('_mock_session')
      notify('SIGNED_OUT', null)
      return { error: null }
    },
  },

  from: (table: string) => new QB(table),
}
