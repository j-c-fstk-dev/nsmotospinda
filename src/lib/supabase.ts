import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Lido ANTES de criar o cliente: o Supabase consome o link do e-mail assim que
// o site carrega, e a página de nova senha precisa saber que veio de lá.
const startUrl = typeof window === 'undefined' ? '' : window.location.hash + window.location.search
let recovery = /type=recovery/.test(startUrl)
export const RECOVERY_LINK_ERROR = /error_code=|[?&#]error=/.test(startUrl)

export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null
export const DEMO_MODE = !supabase

supabase?.auth.onAuthStateChange((event) => {
  if (event === 'PASSWORD_RECOVERY') recovery = true
})

/** true quando a sessão atual foi aberta pelo link de recuperação de senha */
export const cameFromRecoveryLink = () => recovery
