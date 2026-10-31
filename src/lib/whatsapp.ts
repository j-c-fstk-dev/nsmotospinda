import type { StoreSettings, Vehicle } from './types'
import { money, effectivePrice, vehicleTitle, yearLabel } from './format'

export function waNumber(s: StoreSettings) {
  const digits = s.whatsapp.replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

export function waLink(s: StoreSettings, text: string) {
  return `https://wa.me/${waNumber(s)}?text=${encodeURIComponent(text)}`
}

export function waVehicleText(v: Vehicle, origin: string) {
  return `Olá! Vi no site a ${vehicleTitle(v)} ${yearLabel(v)} por ${money(effectivePrice(v))}. Ela ainda está disponível?\n${origin}/moto/${v.slug}`
}

export function waTradeText(v: Vehicle) {
  return `Olá! Tenho interesse na ${vehicleTitle(v)} ${yearLabel(v)} e quero dar minha moto na troca. Podem avaliar?`
}

export const WA_GENERAL = 'Olá! Vim pelo site da NS Multimarcas e gostaria de mais informações.'
