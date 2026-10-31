import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useSite, usePageTitle } from '../lib/SiteContext'
import { MOTO_CATEGORIES } from '../lib/categories'
import { effectivePrice, km, vehicleTitle, yearLabel } from '../lib/format'
import { waLink, WA_GENERAL } from '../lib/whatsapp'
import { track } from '../lib/store'
import { VehicleCard } from '../components/VehicleCard'
import { VehicleImage } from '../components/VehicleImage'
import { Plate } from '../components/Plate'
import { ReviewCard } from '../components/ReviewCard'
import { MapBlock } from '../components/MapBlock'
import { WhatsAppIcon } from '../components/Icons'

// Serviços como aparecem no material da própria loja
const SERVICES = [
  { t: 'Motos seminovas e usadas', d: 'Todas as marcas e cilindradas, revisadas antes de sair.' },
  { t: 'Carros seminovos e usados', d: 'Também trabalhamos com carros. Pergunte o que tem no pátio.' },
  { t: 'Consignação', d: 'Deixe sua moto ou carro com a gente e vendemos com segurança e transparência.' },
  { t: 'Financiamento facilitado', d: 'Simulação com os principais bancos e entrada parcelada no cartão.' },
  { t: 'Consórcio', d: 'Planeje a próxima moto sem juros de financiamento.' },
]

const WA_CONSIGN = 'Olá! Quero vender minha moto/carro. Como funciona a consignação na NS Multimarcas?'

const STEPS = [
  { t: 'Escolha a moto', d: 'Veja o estoque aqui no site ou venha olhar de perto na loja, no centro de Pinda.' },
  { t: 'Traga a sua na troca', d: 'Avaliamos sua moto ou carro na hora e o valor entra como parte do pagamento.' },
  { t: 'Monte o pagamento', d: 'Financiamento bancário, entrada parcelada no cartão ou à vista. A gente simula com você.' },
  { t: 'Saia rodando', d: 'Moto revisada, documentação conferida e garantia de motor e câmbio.' },
]

export default function Home() {
  usePageTitle('')
  const { vehicles, settings, loading } = useSite()
  const available = useMemo(() => vehicles.filter((v) => v.status !== 'vendido'), [vehicles])
  const featured = available.filter((v) => v.featured).slice(0, 6)
  const offers = available.filter((v) => v.promo_price && v.promo_price < v.price).slice(0, 4)
  const hero = featured.find((v) => v.status === 'disponivel') ?? available[0]
  const wa = waLink(settings, WA_GENERAL)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MotorcycleDealer',
    name: settings.store_name,
    address: { '@type': 'PostalAddress', streetAddress: settings.address, addressLocality: 'Pindamonhangaba', addressRegion: 'SP', addressCountry: 'BR' },
    telephone: settings.whatsapp,
    sameAs: [settings.instagram, settings.facebook].filter(Boolean),
    openingHours: settings.hours,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__copy">
            <h1 className="hero__title">Moto revisada, com garantia, no centro de Pinda.</h1>
            <p className="hero__lead">
              Seminovas de todas as marcas. Avaliamos a sua na troca, financiamos e parcelamos a entrada no cartão.
            </p>
            <div className="hero__ctas">
              <Link to="/estoque" className="btn btn--primary btn--lg">
                Ver estoque completo
              </Link>
              <a className="btn btn--wa btn--lg" href={wa} target="_blank" rel="noopener" onClick={() => track('whatsapp')}>
                <WhatsAppIcon size={20} /> Chamar no WhatsApp
              </a>
            </div>
            <ul className="hero__facts">
              <li><strong>{loading ? '–' : available.length}</strong> veículos no pátio</li>
              <li><strong>90 dias</strong> de garantia</li>
              <li><strong>12x</strong> entrada no cartão</li>
            </ul>
          </div>

          {hero && (
            <Link to={`/moto/${hero.slug}`} className="hero__bike">
              <div className="hero__photo">
                <VehicleImage src={hero.images[0]} alt={`${vehicleTitle(hero)} ${yearLabel(hero)}`} eager />
              </div>
              <div className="hero__tag">
                <p className="hero__tag-name">
                  {hero.brand} <strong>{hero.model}</strong>
                </p>
                <p className="vcard__meta">
                  <span>{yearLabel(hero)}</span>
                  <span>{km(hero.km)}</span>
                </p>
                <Plate size="lg" price={effectivePrice(hero)} band="destaque da semana" />
              </div>
            </Link>
          )}
        </div>
      </section>

      <section className="services" aria-label="O que fazemos">
        <div className="wrap">
          <ul className="services__list">
            {SERVICES.map((s) => (
              <li key={s.t}>
                <h2 className="services__t">{s.t}</h2>
                <p className="services__d">{s.d}</p>
              </li>
            ))}
          </ul>
          <p className="services__cta">
            Quer vender a sua?{' '}
            <a className="link" href={waLink(settings, WA_CONSIGN)} target="_blank" rel="noopener" onClick={() => track('whatsapp')}>
              Fale sobre consignação no WhatsApp
            </a>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="cat-h">
        <div className="wrap">
          <div className="section__head">
            <h2 id="cat-h" className="section__title">Qual é o seu tipo de moto?</h2>
            <Link to="/estoque" className="link">Ver todas</Link>
          </div>
          <ul className="cats">
            {MOTO_CATEGORIES.map((c) => {
              const inCat = available.filter((v) => v.category === c.id)
              const thumb = inCat.find((v) => v.images[0])?.images[0]
              return (
                <li key={c.id}>
                  <Link to={`/estoque?categoria=${c.id}`} className="cat">
                    <div className="cat__img">
                      <VehicleImage src={thumb} alt="" />
                    </div>
                    <div className="cat__text">
                      <span className="cat__name">{c.name}</span>
                      <span className="cat__short">{c.short}</span>
                    </div>
                    <span className="cat__count" aria-label={`${inCat.length} disponíveis`}>{inCat.length}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section section--tint" aria-labelledby="dest-h">
          <div className="wrap">
            <div className="section__head">
              <h2 id="dest-h" className="section__title">Destaques do pátio</h2>
              <Link to="/estoque" className="link">Estoque completo</Link>
            </div>
            <div className="grid">
              {featured.map((v) => (
                <VehicleCard key={v.id} v={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      {offers.length > 0 && (
        <section className="section offers" aria-labelledby="of-h">
          <div className="wrap">
            <div className="section__head">
              <h2 id="of-h" className="section__title">Baixou o preço</h2>
              <Link to="/estoque?ofertas=1" className="link link--light">Todas as ofertas</Link>
            </div>
            <div className="grid grid--4">
              {offers.map((v) => (
                <VehicleCard key={v.id} v={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" id="como-comprar" aria-labelledby="como-h">
        <div className="wrap how">
          <div className="how__intro">
            <h2 id="como-h" className="section__title">Como funciona a compra</h2>
            <p className="how__lead">{settings.warranty_text}</p>
          </div>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.t} className="step">
                <span className="step__n" aria-hidden="true">{i + 1}</span>
                <h3 className="step__t">{s.t}</h3>
                <p className="step__d">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--tint" id="loja" aria-labelledby="loja-h">
        <div className="wrap">
          <h2 id="loja-h" className="section__title">Onde estamos</h2>
          <MapBlock settings={settings} />
          <ReviewCard settings={settings} />
        </div>
      </section>
    </>
  )
}
