import type { StoreSettings, Vehicle } from './types'
import { money, effectivePrice, vehicleTitle, yearLabel } from './format'
import { vehiclePath, words } from './words'

export function waNumber(s: StoreSettings) {
  const digits = s.whatsapp.replace(/\D/g, '')
  return digits.startsWith('55') ? digits : `55${digits}`
}

export function waLink(s: StoreSettings, text: string) {
  return `https://wa.me/${waNumber(s)}?text=${encodeURIComponent(text)}`
}

export function waVehicleText(v: Vehicle, origin: string) {
  const w = words(v.type)
  return `Olá! Vi no site ${w.art} ${vehicleTitle(v)} ${yearLabel(v)} por ${money(effectivePrice(v))}. ${w.pron} ainda está disponível?
${origin}${vehiclePath(v)}`
}

export function waTradeText(v: Vehicle) {
  const w = words(v.type)
  return `Olá! Tenho interesse ${w.em} ${vehicleTitle(v)} ${yearLabel(v)} e tenho um veículo para dar na troca. Podem avaliar?`
}

export const WA_GENERAL = 'Olá! Vim pelo site da NS Multimarcas e gostaria de mais informações.'
