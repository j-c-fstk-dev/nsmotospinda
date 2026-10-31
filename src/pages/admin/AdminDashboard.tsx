import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSite } from '../../lib/SiteContext'
import { listEvents } from '../../lib/store'
import type { TrackEvent } from '../../lib/types'
import { money, effectivePrice, vehicleTitle } from '../../lib/format'

export default function AdminDashboard() {
  const { vehicles } = useSite()
  const [events, setEvents] = useState<TrackEvent[]>([])

  useEffect(() => {
    listEvents().then(setEvents).catch(() => setEvents([]))
  }, [])

  const since = Date.now() - 30 * 864e5
  const recent = events.filter((e) => !e.created_at || new Date(e.created_at).getTime() >= since)
  const wa = recent.filter((e) => e.kind === 'whatsapp').length
  const views = recent.filter((e) => e.kind === 'view').length
  const reviews = recent.filter((e) => e.kind === 'review').length

  const stockValue = vehicles.filter((v) => v.status === 'disponivel').reduce((s, v) => s + effectivePrice(v), 0)
  const counts = {
    disponivel: vehicles.filter((v) => v.status === 'disponivel').length,
    reservado: vehicles.filter((v) => v.status === 'reservado').length,
    vendido: vehicles.filter((v) => v.status === 'vendido').length,
    oferta: vehicles.filter((v) => v.promo_price && v.promo_price < v.price && v.status !== 'vendido').length,
  }

  const top = useMemo(() => {
    const m = new Map<string, { views: number; wa: number }>()
    for (const e of recent) {
      if (!e.vehicle_id) continue
      const r = m.get(e.vehicle_id) ?? { views: 0, wa: 0 }
      if (e.kind === 'view') r.views++
      if (e.kind === 'whatsapp') r.wa++
      m.set(e.vehicle_id, r)
    }
    return [...m.entries()]
      .map(([id, r]) => ({ v: vehicles.find((x) => x.id === id), ...r }))
      .filter((r) => r.v)
      .sort((a, b) => b.wa - a.wa || b.views - a.views)
      .slice(0, 8)
  }, [recent, vehicles])

  return (
    <div className="admin__page">
      <header className="admin__head">
        <h1>Resumo</h1>
        <Link to="/admin/veiculos/novo" className="btn btn--primary">Cadastrar veículo</Link>
      </header>

      <div className="kpis">
        <div className="kpi"><span>Disponíveis</span><strong>{counts.disponivel}</strong></div>
        <div className="kpi"><span>Reservados</span><strong>{counts.reservado}</strong></div>
        <div className="kpi"><span>Em oferta</span><strong>{counts.oferta}</strong></div>
        <div className="kpi"><span>Valor do pátio</span><strong>{money(stockValue)}</strong></div>
      </div>

      <h2 className="admin__h2">Últimos 30 dias</h2>
      <div className="kpis">
        <div className="kpi"><span>Visitas em anúncios</span><strong>{views}</strong></div>
        <div className="kpi kpi--wa"><span>Cliques no WhatsApp</span><strong>{wa}</strong></div>
        <div className="kpi"><span>Cliques para avaliar</span><strong>{reviews}</strong></div>
        <div className="kpi"><span>Vendidos (marcados)</span><strong>{counts.vendido}</strong></div>
      </div>

      <h2 className="admin__h2">Anúncios que mais geram contato</h2>
      {top.length === 0 ? (
        <p className="muted">Ainda sem dados. Os números aparecem conforme as pessoas abrem anúncios e chamam no WhatsApp.</p>
      ) : (
        <table className="table">
          <thead>
            <tr><th>Veículo</th><th className="num">Visitas</th><th className="num">WhatsApp</th></tr>
          </thead>
          <tbody>
            {top.map((r) => (
              <tr key={r.v!.id}>
                <td><Link to={`/admin/veiculos/${r.v!.id}`}>{vehicleTitle(r.v!)}</Link></td>
                <td className="num">{r.views}</td>
                <td className="num">{r.wa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
