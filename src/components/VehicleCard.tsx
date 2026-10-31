import { Link } from 'react-router-dom'
import type { Vehicle } from '../lib/types'
import { isPromo, km, vehicleTitle, yearLabel } from '../lib/format'
import { useSite } from '../lib/SiteContext'
import { Plate } from './Plate'
import { statusLabel, vehiclePath } from '../lib/words'
import { VehicleImage } from './VehicleImage'


export function VehicleCard({ v, eager = false }: { v: Vehicle; eager?: boolean }) {
  const { catName } = useSite()
  const promo = isPromo(v)
  return (
    <article className={`vcard ${v.status !== 'disponivel' ? 'vcard--off' : ''}`}>
      <Link to={vehiclePath(v)} className="vcard__link">
        <div className="vcard__media">
          <VehicleImage src={v.images[0]} alt={`${vehicleTitle(v)} ${yearLabel(v)}`} eager={eager} />
          {v.status !== 'disponivel' && <span className="vcard__status">{statusLabel(v)}</span>}
          {promo && v.promo_label && <span className="vcard__promo">{v.promo_label}</span>}
        </div>
        <div className="vcard__body">
          <div className="vcard__text">
            <p className="vcard__cat">{catName(v.category)}</p>
            <h3 className="vcard__title">
              {v.brand} <strong>{v.model}</strong>
            </h3>
            <p className="vcard__meta">
              <span>{yearLabel(v)}</span>
              <span>{km(v.km)}</span>
              {v.displacement_cc ? <span>{v.displacement_cc} cc</span> : null}
            </p>
          </div>
          <Plate size="sm" price={promo ? v.promo_price! : v.price} from={promo ? v.price : null} promo={promo} band={promo ? 'oferta' : 'à vista'} />
        </div>
      </Link>
    </article>
  )
}
