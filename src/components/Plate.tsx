import { money } from '../lib/format'

// Bandeira do Brasil desenhada em SVG (como na faixa da placa Mercosul)
function BrazilFlag() {
  return (
    <svg className="plate__flag" viewBox="0 0 20 14" width="16" height="11" aria-hidden="true">
      <rect width="20" height="14" rx="1" fill="#009c3b" />
      <path d="M10 1.6 18.4 7 10 12.4 1.6 7z" fill="#ffdf00" />
      <circle cx="10" cy="7" r="3.5" fill="#002776" />
      <path d="M6.65 6.1c2.3-.5 4.7.1 6.75 1.6" fill="none" stroke="#fff" strokeWidth=".75" />
    </svg>
  )
}

// Preço apresentado como placa Mercosul. É o elemento de assinatura do site.
export function Plate({ price, from, band = 'à vista', size = 'md', promo = false }: { price: number; from?: number | null; band?: string; size?: 'sm' | 'md' | 'lg'; promo?: boolean }) {
  return (
    <div className={`plate plate--${size} ${promo ? 'plate--promo' : ''}`}>
      <div className="plate__band">
        <span>{band}</span>
        <BrazilFlag />
      </div>
      <div className="plate__body">
        {from ? <s className="plate__from">{money(from)}</s> : null}
        <span className="plate__value">{money(price)}</span>
      </div>
    </div>
  )
}
