// Classificação baseada nos segmentos usados pela Fenabrave/ABRACICLO
// (City/Street, Trail, Maxtrail/Big Trail, Scooter, Naked, Sport, Custom, Touring)
// adaptada para os nomes que o comprador brasileiro usa no dia a dia.
export interface Category {
  id: string
  name: string
  short: string
  description: string
}

export const MOTO_CATEGORIES: Category[] = [
  { id: 'street', name: 'Street', short: 'Dia a dia', description: 'Econômicas, leves e fáceis de manter. A moto do trabalho e da cidade.' },
  { id: 'trail', name: 'Trail', short: 'Asfalto e terra', description: 'Suspensão mais alta e pneus mistos para estrada de terra e buraco.' },
  { id: 'scooter', name: 'Scooter', short: 'Automática', description: 'Câmbio automático, porta-objetos e pilotagem confortável.' },
  { id: 'naked', name: 'Naked', short: 'Sem carenagem', description: 'Motor de esportiva com guidão alto, para a cidade e a serra.' },
  { id: 'esportiva', name: 'Esportiva', short: 'Carenada', description: 'Carenagem completa, posição inclinada e foco em desempenho.' },
  { id: 'big-trail', name: 'Big Trail', short: 'Viagem e aventura', description: 'Alta cilindrada, tanque grande e suspensão de curso longo.' },
  { id: 'custom', name: 'Custom', short: 'Estilo clássico', description: 'Banco baixo, pés à frente e torque de sobra para passear.' },
  { id: 'touring', name: 'Touring', short: 'Estrada longa', description: 'Proteção de vento, malas e conforto para dois em viagens.' },
]

export const CAR_CATEGORIES: Category[] = [
  { id: 'hatch', name: 'Hatch', short: 'Compacto', description: 'Compactos para a cidade.' },
  { id: 'sedan', name: 'Sedã', short: 'Porta-malas', description: 'Mais espaço para a família.' },
  { id: 'suv', name: 'SUV', short: 'Utilitário', description: 'Posição alta e versatilidade.' },
  { id: 'picape', name: 'Picape', short: 'Carga', description: 'Para trabalho e lazer.' },
]

export const ALL_CATEGORIES = [...MOTO_CATEGORIES, ...CAR_CATEGORIES]

export function categoryName(id: string): string {
  return ALL_CATEGORIES.find((c) => c.id === id)?.name ?? id
}

export const BRANDS = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Triumph', 'Harley-Davidson', 'Royal Enfield', 'Dafra', 'Shineray', 'Haojue', 'Outra']
