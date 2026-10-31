import type { Vehicle, VehicleType } from './types'

// Palavras que dependem do tipo do veículo (gênero e substantivo).
// Moto é feminino, carro é masculino: "a moto / o carro", "vendida / vendido".
const WORDS = {
  moto: { noun: 'moto', art: 'a', em: 'na', this: 'essa', pron: 'Ela', reserved: 'Reservada', sold: 'Vendida', available: 'Disponível' },
  carro: { noun: 'carro', art: 'o', em: 'no', this: 'esse', pron: 'Ele', reserved: 'Reservado', sold: 'Vendido', available: 'Disponível' },
} as const

export function words(type: VehicleType | undefined) {
  return WORDS[type === 'carro' ? 'carro' : 'moto']
}

export function statusLabel(v: Pick<Vehicle, 'type' | 'status'>) {
  const w = words(v.type)
  return v.status === 'reservado' ? w.reserved : v.status === 'vendido' ? w.sold : w.available
}

/** Endereço do anúncio: /moto/... ou /carro/... */
export function vehiclePath(v: Pick<Vehicle, 'type' | 'slug'>) {
  return `/${v.type === 'carro' ? 'carro' : 'moto'}/${v.slug}`
}
