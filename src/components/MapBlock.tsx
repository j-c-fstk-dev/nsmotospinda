import type { StoreSettings } from '../lib/types'
import { PinIcon } from './Icons'

export function mapsUrl(s: StoreSettings) {
  return s.google_profile_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.maps_query)}`
}

export function MapBlock({ settings }: { settings: StoreSettings }) {
  const q = encodeURIComponent(settings.maps_query)
  return (
    <div className="map">
      <iframe
        title={`Mapa: ${settings.address}, ${settings.city}`}
        src={`https://maps.google.com/maps?q=${q}&z=16&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="map__card">
        <p className="map__addr">
          <PinIcon size={18} />
          <span>
            {settings.address}
            <br />
            {settings.neighborhood}, {settings.city}
          </span>
        </p>
        <ul className="map__hours">
          {settings.hours.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
        <div className="map__actions">
          <a className="btn btn--primary" href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener">
            Traçar rota
          </a>
          <a className="btn btn--ghost" href={mapsUrl(settings)} target="_blank" rel="noopener">
            Ver no Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}
