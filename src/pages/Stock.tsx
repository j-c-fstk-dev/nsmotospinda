import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSite, usePageTitle } from '../lib/SiteContext'
import { effectivePrice, isPromo } from '../lib/format'
import { VehicleCard } from '../components/VehicleCard'

const SORTS = {
  recentes: 'Mais recentes',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  'menor-km': 'Menor km',
  'mais-novas': 'Ano mais novo',
} as const
type Sort = keyof typeof SORTS

export default function Stock() {
  const { publicVehicles: pool, categories, catName, loading, error } = useSite()
  const [params, setParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const cat = params.get('categoria') ?? ''
  const brand = params.get('marca') ?? ''
  const q = params.get('q') ?? ''
  const max = Number(params.get('ate') ?? 0)
  const offers = params.get('ofertas') === '1'
  const sort = (params.get('ordem') as Sort) || 'recentes'

  usePageTitle(cat ? catName(cat) : 'Estoque')

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params)
    if (v) p.set(k, v)
    else p.delete(k)
    setParams(p, { replace: true })
  }

  const brands = useMemo(() => [...new Set(pool.map((v) => v.brand))].sort(), [pool])
  const usedCats = categories.filter((c) => c.visible && pool.some((v) => v.category === c.id))

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    const r = pool.filter(
      (v) =>
        (!cat || v.category === cat) &&
        (!brand || v.brand === brand) &&
        (!max || effectivePrice(v) <= max) &&
        (!offers || isPromo(v)) &&
        (!term || `${v.brand} ${v.model} ${v.version} ${v.color}`.toLowerCase().includes(term)),
    )
    const by: Record<Sort, (a: typeof r[0], b: typeof r[0]) => number> = {
      recentes: (a, b) => b.created_at.localeCompare(a.created_at),
      'menor-preco': (a, b) => effectivePrice(a) - effectivePrice(b),
      'maior-preco': (a, b) => effectivePrice(b) - effectivePrice(a),
      'menor-km': (a, b) => a.km - b.km,
      'mais-novas': (a, b) => b.year_model - a.year_model,
    }
    return r.sort(by[sort] ?? by.recentes)
  }, [pool, cat, brand, max, offers, q, sort])

  const activeCat = categories.find((c) => c.id === cat)
  const filtersOn = [cat, brand, q, max ? '1' : '', offers ? '1' : ''].filter(Boolean).length

  return (
    <section className="section stock">
      <div className="wrap">
        <header className="stock__head">
          <h1 className="page-title">{activeCat ? activeCat.name : offers ? 'Ofertas' : 'Estoque'}</h1>
          <p className="stock__lead">{activeCat ? activeCat.description : 'Tudo o que está no pátio agora. Chegou novidade? Ela aparece aqui primeiro.'}</p>
        </header>

        <div className="chips" role="group" aria-label="Categorias">
          <button className={`chip ${!cat ? 'chip--on' : ''}`} onClick={() => set('categoria', '')} aria-pressed={!cat}>
            Todas
          </button>
          {usedCats.map((c) => (
            <button key={c.id} className={`chip ${cat === c.id ? 'chip--on' : ''}`} onClick={() => set('categoria', cat === c.id ? '' : c.id)} aria-pressed={cat === c.id}>
              {c.name}
            </button>
          ))}
        </div>

        <div className="stock__bar">
          <button className="btn btn--ghost stock__filter-btn" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
            Filtros{filtersOn ? ` (${filtersOn})` : ''}
          </button>
          <p className="stock__count" aria-live="polite">
            {loading ? 'Carregando…' : `${list.length} ${list.length === 1 ? 'veículo' : 'veículos'}`}
          </p>
          <label className="field field--inline">
            <span>Ordenar</span>
            <select value={sort} onChange={(e) => set('ordem', e.target.value === 'recentes' ? '' : e.target.value)}>
              {Object.entries(SORTS).map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="stock__layout">
          <aside className={`filters ${showFilters ? 'filters--open' : ''}`} aria-label="Filtros">
            <label className="field">
              <span>Buscar modelo</span>
              <input type="search" value={q} placeholder="Ex.: XRE, Fazer, PCX" onChange={(e) => set('q', e.target.value)} />
            </label>
            <label className="field">
              <span>Marca</span>
              <select value={brand} onChange={(e) => set('marca', e.target.value)}>
                <option value="">Todas</option>
                {brands.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Preço até</span>
              <select value={max || ''} onChange={(e) => set('ate', e.target.value)}>
                <option value="">Qualquer valor</option>
                {[10000, 15000, 20000, 30000, 50000, 80000].map((p) => (
                  <option key={p} value={p}>R$ {p.toLocaleString('pt-BR')}</option>
                ))}
              </select>
            </label>
            <label className="check">
              <input type="checkbox" checked={offers} onChange={(e) => set('ofertas', e.target.checked ? '1' : '')} />
              <span>Só ofertas</span>
            </label>
            {filtersOn > 0 && (
              <button className="link" onClick={() => setParams({}, { replace: true })}>
                Limpar filtros
              </button>
            )}
          </aside>

          <div>
            {error && <p className="notice notice--error">{error}</p>}
            {!loading && list.length === 0 ? (
              <div className="empty">
                <h2>Nenhum veículo com esses filtros agora</h2>
                <p>Chega estoque novo toda semana. Tire um filtro ou chame no WhatsApp que a gente avisa quando entrar.</p>
                <button className="btn btn--primary" onClick={() => setParams({}, { replace: true })}>
                  Ver todo o estoque
                </button>
              </div>
            ) : (
              <div className="grid grid--stock">
                {list.map((v) => (
                  <VehicleCard key={v.id} v={v} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
