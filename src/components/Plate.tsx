import { money } from '../lib/format'

// Preço apresentado como placa Mercosul. É o elemento de assinatura do site.
export function Plate({ price, from, band = 'à vista', size = 'md', promo = false }: { price: number; from?: number | null; band?: string; size?: 'sm' | 'md' | 'lg'; promo?: boolean }) {
  return (
    <div className={`plate plate--${size} ${promo ? 'plate--promo' : ''}`}>
      <div className="plate__band">
        <span>{band}</span>
        <span className="plate__flag" aria-hidden="true" />
      </div>
      <div className="plate__body">
        {from ? <s className="plate__from">{money(from)}</s> : null}
        <span className="plate__value">{money(price)}</span>
      </div>
    </div>
  )
}
