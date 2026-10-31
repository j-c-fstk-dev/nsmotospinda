import { useState } from 'react'

export function VehicleImage({ src, alt, className = '', eager = false }: { src?: string; alt: string; className?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className={`vimg vimg--empty ${className}`} role="img" aria-label={alt}>
        <span>Foto em breve</span>
      </div>
    )
  }
  return (
    <img
      className={`vimg ${className}`}
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
