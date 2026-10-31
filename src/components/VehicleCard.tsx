import { Link } from 'react-router-dom'
import type { Vehicle } from '../lib/types'
import { km, vehicleTitle, yearLabel } from '../lib/format'
import { categoryName } from '../lib/categories'
import { Plate } from './Plate'
import { VehicleImage } from './VehicleImage'

const STATUS: Record<string, string> = { reservado: 'Reservada', vendido: 'Vendida' }

export function VehicleCard({ v }: { v: Vehicle }) {
  const promo = !!(v.promo_price && v.promo_price < v.price)
  return (
    <article className={`vcard ${v.status !== 'disponivel' ? 'vcard--off' : ''}`}>
      <Link to={`/moto/${v.slug}`} className="vcard__link">
        <div className="vcard__media">
          <VehicleImage src={v.images[0]} alt={`${vehicleTitle(v)} ${yearLabel(v)}`} />
          {STATUS[v.status] && <span className="vcard__status">{STATUS[v.status]}</span>}
          {promo && v.promo_label && <span className="vcard__promo">{v.promo_label}</span>}
        </div>
        <div className="vcard__body">
          <p className="vcard__cat">{categoryName(v.category)}</p>
          <h3 className="vcard__title">
            {v.brand} <strong>{v.model}</strong>
          </h3>
          <p className="vcard__meta">
            <span>{yearLabel(v)}</span>
            <span>{km(v.km)}</span>
            {v.displacement_cc ? <span>{v.displacement_cc} cc</span> : null}
          </p>
          <Plate size="sm" price={promo ? v.promo_price! : v.price} from={promo ? v.price : null} promo={promo} band={promo ? 'oferta' : 'à vista'} />
        </div>
      </Link>
    </article>
  )
}
