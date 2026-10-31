import type { StoreSettings } from '../lib/types'

export function mapsUrl(s: StoreSettings) {
  return s.google_profile_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.maps_query)}`
}

export function MapFrame({ settings }: { settings: StoreSettings }) {
  return (
    <div className="visit__map">
      <iframe
        title={`Mapa: ${settings.address}, ${settings.city}`}
        src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.maps_query)}&z=16&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}

export function VisitInfo({ settings }: { settings: StoreSettings }) {
  const q = encodeURIComponent(settings.maps_query)
  return (
    <>
      <p className="visit__addr">
        {settings.address}
        <br />
        {settings.neighborhood}, {settings.city}
      </p>
      <ul className="visit__hours">
        {settings.hours.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <div className="visit__actions">
        <a className="btn btn--ink" href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener">
          Traçar rota
        </a>
        <a className="btn btn--ghost" href={mapsUrl(settings)} target="_blank" rel="noopener">
          Abrir no Google Maps
        </a>
      </div>
    </>
  )
}
