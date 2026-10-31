import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSite, usePageTitle } from '../lib/SiteContext'
import { categoryName } from '../lib/categories'
import { effectivePrice, installment, km, money, n, vehicleTitle, yearLabel } from '../lib/format'
import { waLink, waTradeText, waVehicleText } from '../lib/whatsapp'
import { track } from '../lib/store'
import { VehicleImage } from '../components/VehicleImage'
import { VehicleCard } from '../components/VehicleCard'
import { Plate } from '../components/Plate'
import { WhatsAppIcon } from '../components/Icons'
import NotFound from './NotFound'

const TERMS = [12, 24, 36, 48]

export default function VehicleDetail() {
  const { slug } = useParams()
  const { vehicles, settings, loading } = useSite()
  const v = vehicles.find((x) => x.slug === slug)
  const [img, setImg] = useState(0)
  const price = v ? effectivePrice(v) : 0
  const [downPct, setDownPct] = useState(30)
  const [term, setTerm] = useState(36)

  usePageTitle(v ? `${vehicleTitle(v)} ${yearLabel(v)}` : '')

  useEffect(() => {
    setImg(0)
    if (v) track('view', v.id)
  }, [v?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const related = useMemo(
    () => (v ? vehicles.filter((x) => x.id !== v.id && x.category === v.category && x.status !== 'vendido').slice(0, 3) : []),
    [vehicles, v],
  )

  if (loading) return <div className="section wrap">Carregando…</div>
  if (!v) return <NotFound />

  const promo = !!(v.promo_price && v.promo_price < v.price)
  const down = Math.round((price * downPct) / 100)
  const monthly = installment(price - down, settings.finance_rate_monthly, term)
  const origin = window.location.origin
  const sold = v.status === 'vendido'

  const specs: [string, string][] = [
    ['Marca', v.brand],
    ['Modelo', `${v.model}${v.version ? ` ${v.version}` : ''}`],
    ['Ano', yearLabel(v)],
    ['Quilometragem', km(v.km)],
    ['Cilindrada', v.displacement_cc ? `${n(v.displacement_cc)} cc` : '–'],
    ['Combustível', v.fuel || '–'],
    ['Cor', v.color || '–'],
    ['Categoria', categoryName(v.category)],
  ]

  return (
    <>
      <section className="section detail">
        <div className="wrap">
          <nav className="crumbs" aria-label="Você está em">
            <Link to="/estoque">Estoque</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/estoque?categoria=${v.category}`}>{categoryName(v.category)}</Link>
          </nav>

          <div className="detail__grid">
            <div className="gallery">
              <div className="gallery__main">
                <VehicleImage src={v.images[img]} alt={`${vehicleTitle(v)} ${yearLabel(v)}, foto ${img + 1}`} eager />
              </div>
              {v.images.length > 1 && (
                <div className="gallery__thumbs">
                  {v.images.map((src, i) => (
                    <button key={src + i} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`Ver foto ${i + 1}`}>
                      <VehicleImage src={src} alt="" />
                    </button>
                  ))}
                </div>
              )}
              {v.image_credit && <p className="gallery__credit">{v.image_credit}</p>}
            </div>

            <div className="detail__info">
              <h1 className="detail__title">
                {v.brand} <strong>{v.model}</strong>
                {v.version && <span className="detail__version"> {v.version}</span>}
              </h1>
              <p className="vcard__meta detail__meta">
                <span>{yearLabel(v)}</span>
                <span>{km(v.km)}</span>
                {v.displacement_cc ? <span>{v.displacement_cc} cc</span> : null}
              </p>

              {sold ? (
                <p className="notice">Essa moto já foi vendida. Veja outras parecidas abaixo.</p>
              ) : (
                <>
                  <Plate size="lg" price={price} from={promo ? v.price : null} promo={promo} band={promo ? v.promo_label || 'oferta' : 'à vista'} />
                  {v.status === 'reservado' && <p className="notice">Reservada no momento. Chame para entrar na fila caso a negociação não feche.</p>}
                  <div className="detail__ctas">
                    <a className="btn btn--wa btn--lg btn--block" href={waLink(settings, waVehicleText(v, origin))} target="_blank" rel="noopener" onClick={() => track('whatsapp', v.id)}>
                      <WhatsAppIcon size={20} /> Tenho interesse
                    </a>
                    <a className="btn btn--ghost btn--block" href={waLink(settings, waTradeText(v))} target="_blank" rel="noopener" onClick={() => track('whatsapp', v.id)}>
                      Quero dar a minha na troca
                    </a>
                  </div>

                  <div className="sim">
                    <h2 className="sim__title">Simule o financiamento</h2>
                    <label className="field">
                      <span>
                        Entrada: <strong>{money(down)}</strong> ({downPct}%)
                      </span>
                      <input type="range" min={0} max={80} step={5} value={downPct} onChange={(e) => setDownPct(Number(e.target.value))} />
                    </label>
                    <div className="sim__terms" role="group" aria-label="Número de parcelas">
                      {TERMS.map((t) => (
                        <button key={t} className={`chip ${t === term ? 'chip--on' : ''}`} aria-pressed={t === term} onClick={() => setTerm(t)}>
                          {t}x
                        </button>
                      ))}
                    </div>
                    <p className="sim__result">
                      <span>{term}x de</span> <strong>{money(monthly)}</strong>
                    </p>
                    <p className="sim__note">
                      Simulação com taxa de {String(settings.finance_rate_monthly).replace('.', ',')}% a.m. O valor final depende da análise de crédito do banco.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="detail__more">
            <div>
              <h2 className="section__title section__title--sm">Ficha</h2>
              <dl className="specs">
                {specs.map(([k, val]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              {v.description && (
                <>
                  <h2 className="section__title section__title--sm">Sobre essa moto</h2>
                  <p className="detail__desc">{v.description}</p>
                </>
              )}
              {v.features.length > 0 && (
                <>
                  <h2 className="section__title section__title--sm">Incluso</h2>
                  <ul className="features">
                    {v.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--tint">
          <div className="wrap">
            <h2 className="section__title">Outras {categoryName(v.category)} no pátio</h2>
            <div className="grid">
              {related.map((r) => (
                <VehicleCard key={r.id} v={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {!sold && (
        <div className="sticky-cta">
          <div>
            <span className="sticky-cta__name">{v.model}</span>
            <strong>{money(price)}</strong>
          </div>
          <a className="btn btn--wa" href={waLink(settings, waVehicleText(v, origin))} target="_blank" rel="noopener" onClick={() => track('whatsapp', v.id)}>
            <WhatsAppIcon size={18} /> WhatsApp
          </a>
        </div>
      )}
    </>
  )
}
