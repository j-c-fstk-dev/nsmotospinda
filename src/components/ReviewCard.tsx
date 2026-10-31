import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { StoreSettings } from '../lib/types'
import { track } from '../lib/store'
import { StarIcon } from './Icons'

export function reviewUrl(s: StoreSettings) {
  if (s.google_review_url) return s.google_review_url
  // Sem o link oficial ainda: abre a busca do perfil no Google Maps
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.maps_query)}`
}

export function useQr(text: string, size = 220) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    QRCode.toDataURL(text, { width: size, margin: 1, color: { dark: '#16140F', light: '#FFFFFF' } }).then(setSrc).catch(() => setSrc(''))
  }, [text, size])
  return src
}

export function ReviewCard({ settings }: { settings: StoreSettings }) {
  const url = reviewUrl(settings)
  const qr = useQr(url)
  const hasRating = settings.google_rating != null

  return (
    <div className="review">
      <div className="review__main">
        <div>
          <h2 className="review__title">Comprou com a gente? Conte como foi.</h2>
          <p className="review__text">
            Sua avaliação no Google ajuda outras pessoas de Pinda a comprarem com segurança. Leva menos de um minuto.
          </p>
          {hasRating && (
            <p className="review__score">
              <strong>{settings.google_rating!.toFixed(1).replace('.', ',')}</strong>
              <span className="review__stars" aria-label={`${settings.google_rating} de 5 estrelas`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon key={i} size={18} filled={i <= Math.round(settings.google_rating!)} />
                ))}
              </span>
              {settings.google_reviews_count ? <span>{settings.google_reviews_count} avaliações</span> : null}
            </p>
          )}
          <div className="review__pick" role="group" aria-label="Escolha sua nota">
            {[1, 2, 3, 4, 5].map((i) => (
              <a key={i} href={url} target="_blank" rel="noopener" aria-label={`Dar ${i} estrela${i > 1 ? 's' : ''}`} onClick={() => track('review')}>
                <StarIcon size={30} filled={false} />
              </a>
            ))}
          </div>
          <a className="link" href={url} target="_blank" rel="noopener" onClick={() => track('review')}>
            Escrever avaliação no Google
          </a>
        </div>
      </div>
      {qr && (
        <figure className="review__qr">
          <img src={qr} alt="QR code para avaliar a loja no Google" width={140} height={140} />
          <figcaption>Aponte a câmera do celular</figcaption>
        </figure>
      )}
    </div>
  )
}
