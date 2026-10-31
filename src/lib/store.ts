// Camada de dados. Sem variáveis do Supabase, roda em MODO DEMO:
// tudo fica salvo no localStorage do navegador (ótimo para apresentar).
// Com VITE_SUPABASE_URL/ANON_KEY definidas, usa o banco e o storage do Supabase.
import { supabase, DEMO_MODE } from './supabase'
import { SEED_VEHICLES, DEFAULT_SETTINGS } from './seed'
import type { StoreSettings, TrackEvent, Vehicle } from './types'

const K = { vehicles: 'ns.vehicles.v1', settings: 'ns.settings.v1', events: 'ns.events.v1', session: 'ns.session.v1' }

export const DEMO_LOGIN = { email: 'admin@nsmultimarcas.com.br', password: 'ns2026' }

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function writeLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    throw new Error('Sem espaço no navegador para salvar. Use fotos menores ou conecte o Supabase.')
  }
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()))

// ---------- Veículos ----------
// Garante campos novos em dados salvos por versões anteriores
const normalize = (v: Vehicle): Vehicle => ({ ...v, hidden: v.hidden ?? false, promo_until: v.promo_until ?? '', features: v.features ?? [], images: v.images ?? [] })

export async function listVehicles(): Promise<Vehicle[]> {
  if (supabase) {
    const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return (data as Vehicle[]).map(normalize)
  }
  return readLS<Vehicle[]>(K.vehicles, SEED_VEHICLES).map(normalize)
}

export async function getVehicle(slug: string): Promise<Vehicle | null> {
  if (supabase) {
    const { data, error } = await supabase.from('vehicles').select('*').eq('slug', slug).maybeSingle()
    if (error) throw error
    return data as Vehicle | null
  }
  return (await listVehicles()).find((v) => v.slug === slug) ?? null
}

export async function saveVehicle(v: Vehicle): Promise<Vehicle> {
  const record = { ...v, id: v.id || uid(), created_at: v.created_at || new Date().toISOString() }
  if (supabase) {
    const { data, error } = await supabase.from('vehicles').upsert(record).select().single()
    if (error) throw error
    return data as Vehicle
  }
  const all = await listVehicles()
  const i = all.findIndex((x) => x.id === record.id)
  if (i >= 0) all[i] = record
  else all.unshift(record)
  writeLS(K.vehicles, all)
  return record
}

export async function deleteVehicle(id: string) {
  if (supabase) {
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeLS(K.vehicles, (await listVehicles()).filter((v) => v.id !== id))
}

// ---------- Configurações da loja ----------
function withDefaults(s: Partial<StoreSettings>): StoreSettings {
  const merged = { ...DEFAULT_SETTINGS, ...s }
  if (!s.categories?.length) merged.categories = DEFAULT_SETTINGS.categories
  if (!s.logo_url || s.logo_url === '/logo-ns.png') merged.logo_url = DEFAULT_SETTINGS.logo_url
  return merged
}

export async function getSettings(): Promise<StoreSettings> {
  if (supabase) {
    const { data } = await supabase.from('settings').select('data').eq('id', 1).maybeSingle()
    return withDefaults((data?.data as Partial<StoreSettings>) ?? {})
  }
  return withDefaults(readLS<Partial<StoreSettings>>(K.settings, {}))
}

export async function saveSettings(s: StoreSettings) {
  if (supabase) {
    const { error } = await supabase.from('settings').upsert({ id: 1, data: s })
    if (error) throw error
    return
  }
  writeLS(K.settings, s)
}

// ---------- Fotos ----------
// Redimensiona no navegador antes de enviar: fotos de celular têm 4–8 MB.
async function resize(file: File, max = 1600, quality = 0.82): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * scale)
  canvas.height = Math.round(bmp.height * scale)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Falha ao processar imagem'))), 'image/jpeg', quality))
}

export async function uploadImage(file: File): Promise<string> {
  if (supabase) {
    const blob = await resize(file)
    const path = `${new Date().getFullYear()}/${uid()}.jpg`
    const { error } = await supabase.storage.from('vehicles').upload(path, blob, { contentType: 'image/jpeg' })
    if (error) throw error
    return supabase.storage.from('vehicles').getPublicUrl(path).data.publicUrl
  }
  // Demo: imagem menor, guardada como data URL no navegador
  const blob = await resize(file, 1000, 0.72)
  return new Promise((res) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.readAsDataURL(blob)
  })
}

// ---------- Métricas (cliques no WhatsApp, visualizações) ----------
export async function track(kind: TrackEvent['kind'], vehicle_id: string | null = null) {
  try {
    if (supabase) {
      await supabase.from('events').insert({ kind, vehicle_id })
    } else {
      const all = readLS<TrackEvent[]>(K.events, [])
      all.push({ kind, vehicle_id, created_at: new Date().toISOString() })
      writeLS(K.events, all.slice(-2000))
    }
  } catch {
    /* métrica nunca pode quebrar a navegação */
  }
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  w.gtag?.('event', kind === 'whatsapp' ? 'click_whatsapp' : kind, { vehicle_id })
}

export async function listEvents(): Promise<TrackEvent[]> {
  if (supabase) {
    const since = new Date(Date.now() - 30 * 864e5).toISOString()
    const { data, error } = await supabase.from('events').select('*').gte('created_at', since).limit(5000)
    if (error) throw error
    return data as TrackEvent[]
  }
  return readLS<TrackEvent[]>(K.events, [])
}

// ---------- Autenticação ----------
export async function signIn(email: string, password: string) {
  if (supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error('E-mail ou senha incorretos.')
    return
  }
  if (email.trim().toLowerCase() !== DEMO_LOGIN.email || password !== DEMO_LOGIN.password) {
    throw new Error('E-mail ou senha incorretos.')
  }
  sessionStorage.setItem(K.session, '1')
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut()
  sessionStorage.removeItem(K.session)
}

export async function isSignedIn(): Promise<boolean> {
  if (supabase) return !!(await supabase.auth.getSession()).data.session
  return sessionStorage.getItem(K.session) === '1'
}

export function resetDemo() {
  localStorage.removeItem(K.vehicles)
  localStorage.removeItem(K.settings)
  localStorage.removeItem(K.events)
}

export { DEMO_MODE }
