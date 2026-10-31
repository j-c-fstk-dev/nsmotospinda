import { Link } from 'react-router-dom'
import { useRef } from 'react'
import { useSite, usePageTitle } from '../lib/SiteContext'
import { effectivePrice, isPromo, vehicleTitle, yearLabel, km } from '../lib/format'
import { waLink, WA_GENERAL } from '../lib/whatsapp'
import { track, byFeaturedRank } from '../lib/store'
import { VehicleCard } from '../components/VehicleCard'
import { VehicleImage } from '../components/VehicleImage'
import { Plate } from '../components/Plate'
import { ReviewCard } from '../components/ReviewCard'
import { MapFrame, VisitInfo } from '../components/MapBlock'
import { WhatsAppIcon } from '../components/Icons'

function ArrowIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      {dir === 'left' ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  )
}

export default function Home() {
  usePageTitle('')
  const { publicVehicles: available, settings, categories } = useSite()
  const featured = available.filter((v) => v.featured).sort(byFeaturedRank).slice(0, 6)
  // o destaque grande só fecha a grade com 3 ou 6 itens
  const lead = featured.length === 3 || featured.length === 6
  const offers = available.filter((v) => isPromo(v)).slice(0, 4)
  const hero = featured.find((v) => v.status === 'disponivel') ?? available[0]
  const wa = waLink(settings, WA_GENERAL)
  const steps = (settings.how_steps ?? []).filter((s) => s.title.trim())
  const services = (settings.services_items ?? []).filter((s) => s.title.trim())
  const strip = useRef<HTMLUListElement>(null)
  const scroll = (d: number) => strip.current?.scrollBy({ left: d * strip.current.clientWidth * 0.8, behavior: 'smooth' })

  const cats = categories
    .filter((c) => c.visible)
    .map((c) => ({ c, list: available.filter((v) => v.category === c.id) }))
    .filter((x) => x.list.length > 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MotorcycleDealer',
    name: settings.store_name,
    image: settings.logo_url,
    address: { '@type': 'PostalAddress', streetAddress: settings.address, addressLocality: 'Pindamonhangaba', addressRegion: 'SP', addressCountry: 'BR' },
    telephone: settings.whatsapp,
    sameAs: [settings.instagram, settings.facebook].filter(Boolean),
    openingHours: settings.hours,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero">
        <div className="hero__media" aria-hidden={!hero}>
          <VehicleImage src={hero?.images[0]} alt={hero ? `${vehicleTitle(hero)} ${yearLabel(hero)}` : ''} eager />
        </div>
        <div className="wrap hero__inner">
          <h1 className="display hero__title">{settings.hero_title}</h1>
          {settings.hero_lead && <p className="hero__lead">{settings.hero_lead}</p>}
          <div className="hero__ctas">
            <Link to="/estoque" className="btn btn--primary btn--lg">
              {settings.hero_cta_label || 'Ver motos à venda'}
            </Link>
            <a className="btn btn--line btn--lg" href={wa} target="_blank" rel="noopener" onClick={() => track('whatsapp')}>
              <WhatsAppIcon size={20} className="wa-glyph" /> Chamar no WhatsApp
            </a>
          </div>
          {hero && (
            <Link to={`/moto/${hero.slug}`} className="hero__tag">
              <p className="hero__tag-name">
                Na foto
                <strong>
                  {hero.brand} {hero.model}
                </strong>
                {yearLabel(hero)}, {km(hero.km)}
              </p>
              <Plate size="lg" price={effectivePrice(hero)} band="ver anúncio" />
            </Link>
          )}
        </div>
        <div className="floor" aria-hidden="true" />
      </section>

      {settings.services_enabled !== false && services.length > 0 && (
      <section className="services" aria-labelledby="serv-h">
        <div className="wrap services__grid">
          <div className="services__intro">
            <h2 id="serv-h" className="section__title services__title">
              {settings.services_title}
            </h2>
            {settings.warranty_text && <p>{settings.warranty_text}</p>}
          </div>
          <ul className="services__list">
            {services.map((s, i) => (
              <li key={i}>
                <h3 className="services__t">{s.title}</h3>
                {s.text && <p className="services__d">{s.text}</p>}
                {i === services.length - 1 && settings.services_cta_label && (
                  <a className="link" href={waLink(settings, settings.services_cta_message || WA_GENERAL)} target="_blank" rel="noopener" onClick={() => track('whatsapp')}>
                    {settings.services_cta_label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
      )}

      {cats.length > 0 && (
        <section className="section cats-sec" aria-labelledby="cat-h">
          <div className="wrap section__head">
            <div>
              <h2 id="cat-h" className="section__title">
                {settings.cats_title}
              </h2>
              {settings.cats_text && <p>{settings.cats_text}</p>}
            </div>
            <div className="cats-nav">
              <button onClick={() => scroll(-1)} aria-label="Categorias anteriores">
                <ArrowIcon dir="left" />
              </button>
              <button onClick={() => scroll(1)} aria-label="Próximas categorias">
                <ArrowIcon dir="right" />
              </button>
            </div>
          </div>
          <ul className="cats" ref={strip}>
            {cats.map(({ c, list }) => (
              <li key={c.id}>
                <Link to={`/estoque?categoria=${c.id}`} className="cat">
                  <div className="cat__img">
                    <VehicleImage src={list.find((v) => v.images[0])?.images[0]} alt="" />
                  </div>
                  <div className="cat__row">
                    <span className="cat__name">{c.name}</span>
                    <span className="cat__count">
                      {list.length} {list.length === 1 ? 'disponível' : 'disponíveis'}
                    </span>
                  </div>
                  <span className="cat__short">{c.short}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {featured.length > 0 && (
        <section className="section" aria-labelledby="dest-h">
          <div className="wrap">
            <div className="section__head">
              <h2 id="dest-h" className="section__title">
                {settings.featured_title}
              </h2>
              <Link to="/estoque" className="link">
                Ver estoque completo
              </Link>
            </div>
            <div className={`grid ${lead ? 'grid--lead' : ''}`}>
              {featured.map((v) => (
                <VehicleCard key={v.id} v={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      {offers.length > 0 && (
        <section className="section offers" aria-labelledby="of-h">
          <div className="floor" aria-hidden="true" />
          <div className="wrap">
            <div className="section__head">
              <div>
                <h2 id="of-h" className="section__title">
                  {settings.offers_title}
                </h2>
                {settings.offers_text && <p>{settings.offers_text}</p>}
              </div>
              <Link to="/estoque?ofertas=1" className="link link--light">
                Todas as ofertas
              </Link>
            </div>
            <div className="grid grid--4">
              {offers.map((v) => (
                <VehicleCard key={v.id} v={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      {settings.how_enabled !== false && steps.length > 0 && (
        <section className="section how-sec" id="como-comprar" aria-labelledby="como-h">
          <div className="wrap how">
            <div>
              <h2 id="como-h" className="section__title">
                {settings.how_title || 'Como funciona a compra'}
              </h2>
              {settings.how_lead && <p className="how__lead">{settings.how_lead}</p>}
            </div>
            <ol className="steps">
              {steps.map((s, i) => (
                <li key={i} className="step">
                  <h3 className="step__t">{s.title}</h3>
                  {s.text && <p className="step__d">{s.text}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="section" id="loja" aria-labelledby="loja-h">
        <div className="wrap visit">
          <MapFrame settings={settings} />
          <div>
            <h2 id="loja-h" className="section__title">
              {settings.visit_title}
            </h2>
            <VisitInfo settings={settings} />
            <ReviewCard settings={settings} />
          </div>
        </div>
      </section>
    </>
  )
}
