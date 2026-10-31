const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('pt-BR')

export const money = (v: number) => brl.format(v)
export const km = (v: number) => (v === 0 ? '0 km' : `${num.format(v)} km`)
export const n = (v: number) => num.format(v)

export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function vehicleTitle(v: { brand: string; model: string }) {
  return `${v.brand} ${v.model}`
}

export function yearLabel(v: { year_fab: number; year_model: number }) {
  return v.year_fab === v.year_model ? String(v.year_model) : `${v.year_fab}/${v.year_model}`
}

export function effectivePrice(v: { price: number; promo_price: number | null }) {
  return v.promo_price && v.promo_price < v.price ? v.promo_price : v.price
}

// Tabela Price: parcela = PV * i / (1 - (1+i)^-n)
export function installment(pv: number, monthlyRate: number, months: number) {
  if (pv <= 0) return 0
  const i = monthlyRate / 100
  if (i === 0) return pv / months
  return (pv * i) / (1 - Math.pow(1 + i, -months))
}
