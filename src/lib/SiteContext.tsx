import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { StoreSettings, Vehicle } from './types'
import { DEFAULT_SETTINGS } from './seed'
import { getSettings, listVehicles } from './store'
import { loadGA } from './analytics'

interface SiteData {
  settings: StoreSettings
  vehicles: Vehicle[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
}

const Ctx = createContext<SiteData>({
  settings: DEFAULT_SETTINGS,
  vehicles: [],
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

  return <Ctx.Provider value={{ settings, vehicles, loading, error, reload }}>{children}</Ctx.Provider>
}

export const useSite = () => useContext(Ctx)

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | NS Multimarcas Pindamonhangaba` : 'NS Multimarcas | Motos seminovas em Pindamonhangaba'
  }, [title])
}
