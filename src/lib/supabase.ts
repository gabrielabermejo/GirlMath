import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { mockSupabase } from './mockSupabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const isDemo =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('YOUR_PROJECT') ||
  supabaseAnonKey.includes('YOUR_ANON')

export const supabase = (
  isDemo ? mockSupabase : createClient(supabaseUrl, supabaseAnonKey)
) as unknown as SupabaseClient

export { isDemo }
