import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSite } from '../../lib/SiteContext'
import { deleteVehicle, saveVehicle } from '../../lib/store'
import type { Vehicle, VehicleStatus } from '../../lib/types'
import { isPromo, km, money, yearLabel } from '../../lib/format'
import { VehicleImage } from '../../components/VehicleImage'
import { StarIcon, EyeIcon } from '../../components/Icons'

export default function AdminVehicles() {
  const { vehicles, reload, catName: categoryName } = useSite()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'' | VehicleStatus | 'oferta' | 'oculto'>('')
  const [msg, setMsg] = useState('')
  const nextRank = Math.max(-1, ...vehicles.filter((x) => x.featured).map((x) => x.featured_rank)) + 1

  const list = useMemo(() => {
    const t = q.toLowerCase()
    const byStatus = (v: Vehicle) => !status || (status === 'oferta' ? isPromo(v) : status === 'oculto' ? v.hidden : v.status === status)
    return vehicles.filter((v) => byStatus(v) && (!t || `${v.brand} ${v.model}`.toLowerCase().includes(t)))
  }, [vehicles, q, status])

  async function patch(v: Vehicle, p: Partial<Vehicle>, done: string) {
    try {
      await saveVehicle({ ...v, ...p })
      await reload()
      setMsg(done)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Não foi possível salvar.')
    }
  }

  async function remove(v: Vehicle) {
    if (!confirm(`Excluir ${v.brand} ${v.model} do site? Para manter o histórico, prefira marcar como vendida.`)) return
    await deleteVehicle(v.id)
    await reload()
    setMsg('Veículo excluído.')
  }

  return (
    <div className="admin__page">
      <header className="admin__head">
        <h1>Veículos</h1>
        <Link to="/admin/veiculos/novo" className="btn btn--primary">Cadastrar veículo</Link>
      </header>

      <div className="admin__tools">
        <input type="search" placeholder="Buscar por marca ou modelo" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar" />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filtrar por situação">
          <option value="">Todas as situações</option>
          <option value="disponivel">Disponíveis</option>
          <option value="reservado">Reservados</option>
          <option value="vendido">Vendidos</option>
          <option value="oferta">Em oferta</option>
          <option value="oculto">Escondidos do site</option>
        </select>
      </div>
      {msg && <p className="toast" role="status" onAnimationEnd={() => setMsg('')}>{msg}</p>}

      <ul className="alist">
        {list.map((v) => (
          <li key={v.id} className="arow">
            <div className="arow__img">
              <VehicleImage src={v.images[0]} alt="" />
            </div>
            <div className="arow__main">
              <Link to={`/admin/veiculos/${v.id}`} className="arow__title">
                {v.brand} {v.model}
                {v.hidden && <span className="tag">Escondido</span>}
                {isPromo(v) && <span className="tag tag--gold">Oferta</span>}
              </Link>
              <span className="arow__meta">
                {categoryName(v.category)}, {yearLabel(v)}, {km(v.km)}
              </span>
              <span className="arow__price">
                {isPromo(v) ? (
                  <>
                    <s>{money(v.price)}</s> {money(v.promo_price!)}
                  </>
                ) : (
                  money(v.price)
                )}
              </span>
            </div>
            <div className="arow__actions">
              <button
                className={`icon-btn ${v.featured ? 'icon-btn--on' : ''}`}
                aria-pressed={v.featured}
                title={v.featured ? 'Retirar destaque' : 'Colocar nos destaques'}
                onClick={() => patch(v, { featured: !v.featured, featured_rank: v.featured ? v.featured_rank : nextRank }, v.featured ? 'Destaque retirado.' : 'Adicionado aos destaques.')}
              >
                <StarIcon size={18} filled={v.featured} />
                <span className="sr-only">Destaque</span>
              </button>
              <button
                className={`icon-btn ${v.hidden ? '' : 'icon-btn--on-ink'}`}
                aria-pressed={!v.hidden}
                title={v.hidden ? 'Mostrar no site' : 'Esconder do site'}
                onClick={() => patch(v, { hidden: !v.hidden }, v.hidden ? 'Agora aparece no site.' : 'Escondido do site.')}
              >
                <EyeIcon size={18} off={v.hidden} />
                <span className="sr-only">{v.hidden ? 'Mostrar no site' : 'Esconder do site'}</span>
              </button>
              <select
                value={v.status}
                aria-label="Situação"
                onChange={(e) => patch(v, { status: e.target.value as VehicleStatus }, 'Situação atualizada.')}
              >
                <option value="disponivel">Disponível</option>
                <option value="reservado">Reservada</option>
                <option value="vendido">Vendida</option>
              </select>
              <Link to={`/admin/veiculos/${v.id}`} className="btn btn--ghost btn--sm">Editar</Link>
              <button className="btn btn--danger btn--sm" onClick={() => remove(v)}>Excluir</button>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="muted">Nenhum veículo encontrado.</p>}
    </div>
  )
}
