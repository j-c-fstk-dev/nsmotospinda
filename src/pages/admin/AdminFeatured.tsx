import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSite } from '../../lib/SiteContext'
import { byFeaturedRank, saveFeaturedOrder, saveVehicle } from '../../lib/store'
import type { Vehicle } from '../../lib/types'
import { effectivePrice, money, yearLabel } from '../../lib/format'
import { VehicleImage } from '../../components/VehicleImage'
import { ArrowUpDown } from '../../components/Icons'

const MAX_HOME = 6

export default function AdminFeatured() {
  const { vehicles, reload } = useSite()
  const saved = useMemo(() => vehicles.filter((v) => v.featured).sort(byFeaturedRank), [vehicles])
  const [list, setList] = useState<Vehicle[]>(saved)
  const [dirty, setDirty] = useState(false)
  const [msg, setMsg] = useState('')
  const [pick, setPick] = useState('')

  useEffect(() => {
    if (!dirty) setList(saved)
  }, [saved, dirty])

  const change = (next: Vehicle[]) => {
    setList(next)
    setDirty(true)
    setMsg('')
  }
  const move = (i: number, to: number) => {
    if (to < 0 || to >= list.length) return
    const next = [...list]
    const [item] = next.splice(i, 1)
    next.splice(to, 0, item)
    change(next)
  }

  const candidates = vehicles.filter((v) => !list.some((x) => x.id === v.id) && v.status !== 'vendido' && !v.hidden)
  const offSite = (v: Vehicle) => v.hidden || v.status === 'vendido'

  async function save() {
    try {
      const removed = saved.filter((v) => !list.some((x) => x.id === v.id))
      for (const v of removed) await saveVehicle({ ...v, featured: false })
      await saveFeaturedOrder(list)
      await reload()
      setDirty(false)
      setMsg('Ordem dos destaques salva.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Não foi possível salvar.')
    }
  }

  return (
    <div className="admin__page">
      <header className="admin__head">
        <h1>Destaques</h1>
        <button className="btn btn--primary" onClick={save} disabled={!dirty}>
          {dirty ? 'Salvar ordem' : 'Tudo salvo'}
        </button>
      </header>
      <p className="muted" style={{ marginTop: -8, maxWidth: '64ch' }}>
        O primeiro da lista é a foto grande do topo do site e o card maior da seção de destaques. A página inicial mostra os {MAX_HOME} primeiros.
      </p>
      {msg && <p className="toast" role="status">{msg}</p>}

      {list.length === 0 ? (
        <p className="notice">Nenhum destaque ainda. Escolha uma moto abaixo ou toque na estrela na lista de veículos.</p>
      ) : (
        <ol className="alist flist">
          {list.map((v, i) => (
            <li key={v.id} className={`arow frow ${i >= MAX_HOME ? 'frow--out' : ''}`}>
              <span className="frow__pos" aria-hidden="true">{i + 1}</span>
              <div className="arow__img">
                <VehicleImage src={v.images[0]} alt="" />
              </div>
              <div className="arow__main">
                <Link to={`/admin/veiculos/${v.id}`} className="arow__title">
                  {v.brand} {v.model}
                  {i === 0 && <span className="tag tag--gold">Topo do site</span>}
                  {offSite(v) && <span className="tag">Fora do site</span>}
                  {i >= MAX_HOME && <span className="tag">Não aparece na página inicial</span>}
                </Link>
                <span className="arow__meta">
                  {yearLabel(v)}, {money(effectivePrice(v))}
                </span>
              </div>
              <div className="arow__actions">
                <button className="btn btn--ghost btn--sm" onClick={() => move(i, 0)} disabled={i === 0}>
                  Pôr no topo
                </button>
                <button className="icon-btn" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Subir ${v.model}`}>
                  <ArrowUpDown dir="up" />
                </button>
                <button className="icon-btn" onClick={() => move(i, i + 1)} disabled={i === list.length - 1} aria-label={`Descer ${v.model}`}>
                  <ArrowUpDown dir="down" />
                </button>
                <button className="btn btn--danger btn--sm" onClick={() => change(list.filter((x) => x.id !== v.id))}>
                  Retirar destaque
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <h2 className="admin__h2">Adicionar aos destaques</h2>
      <div className="row" style={{ maxWidth: 620 }}>
        <select className="row__select" style={{ flex: 1, width: '100%' }} value={pick} onChange={(e) => setPick(e.target.value)} aria-label="Escolher veículo">
          <option value="">Escolha um veículo do estoque</option>
          {candidates.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model} {yearLabel(v)} ({money(effectivePrice(v))})
            </option>
          ))}
        </select>
        <button
          className="btn btn--ink btn--sm"
          style={{ minHeight: 46 }}
          disabled={!pick}
          onClick={() => {
            const v = vehicles.find((x) => x.id === pick)
            if (v) change([...list, v])
            setPick('')
          }}
        >
          Adicionar
        </button>
      </div>
    </div>
  )
}
