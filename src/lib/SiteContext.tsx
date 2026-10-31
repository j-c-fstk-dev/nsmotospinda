import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Category, StoreSettings, Vehicle } from './types'
import { DEFAULT_SETTINGS } from './seed'
import { getSettings, listVehicles } from './store'
import { loadGA } from './analytics'

interface SiteData {
  settings: StoreSettings
  vehicles: Vehicle[]
  /** O que o público vê: sem ocultos, sem vendidos e sem categorias escondidas */
  publicVehicles: Vehicle[]
  categories: Category[]
  catName: (id: string) => string
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

const Ctx = createContext<SiteData>({
  settings: DEFAULT_SETTINGS,
  vehicles: [],
  publicVehicles: [],
  categories: [],
  catName: (id) => id,
  loading: true,
  error: null,
  reload: async () => {},
})

export function SiteProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      const [s, v] = await Promise.all([getSettings(), listVehicles()])
      setSettings(s)
      setVehicles(v)
      setError(null)
      if (s.ga_id) loadGA(s.ga_id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar o estoque.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const categories = settings.categories
  const value = useMemo(() => {
    const hiddenCats = new Set(categories.filter((c) => !c.visible).map((c) => c.id))
    const publicVehicles = vehicles.filter((v) => !v.hidden && v.status !== 'vendido' && !hiddenCats.has(v.category))
    const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id
    return { settings, vehicles, publicVehicles, categories, catName, loading, error, reload }
  }, [settings, vehicles, categories, loading, error, reload])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useSite = () => useContext(Ctx)

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | NS Multimarcas Pindamonhangaba` : 'NS Multimarcas | Motos seminovas em Pindamonhangaba'
  }, [title])
}
