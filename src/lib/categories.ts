import type { Category } from './types'

// Classificação baseada nos segmentos usados pela Fenabrave/ABRACICLO
// (City/Street, Trail, Maxtrail/Big Trail, Scooter, Naked, Sport, Custom, Touring)
// adaptada para os nomes que o comprador brasileiro usa no dia a dia.
// O lojista pode renomear, reordenar, esconder e criar categorias no painel.
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'street', type: 'moto', visible: true, name: 'Street', short: 'Dia a dia', description: 'Econômicas, leves e fáceis de manter. A moto do trabalho e da cidade.' },
  { id: 'trail', type: 'moto', visible: true, name: 'Trail', short: 'Asfalto e terra', description: 'Suspensão mais alta e pneus mistos para estrada de terra e buraco.' },
  { id: 'scooter', type: 'moto', visible: true, name: 'Scooter', short: 'Automática', description: 'Câmbio automático, porta-objetos e pilotagem confortável.' },
  { id: 'naked', type: 'moto', visible: true, name: 'Naked', short: 'Sem carenagem', description: 'Motor de esportiva com guidão alto, para a cidade e a serra.' },
  { id: 'esportiva', type: 'moto', visible: true, name: 'Esportiva', short: 'Carenada', description: 'Carenagem completa, posição inclinada e foco em desempenho.' },
  { id: 'big-trail', type: 'moto', visible: true, name: 'Big Trail', short: 'Viagem e aventura', description: 'Alta cilindrada, tanque grande e suspensão de curso longo.' },
  { id: 'custom', type: 'moto', visible: true, name: 'Custom', short: 'Estilo clássico', description: 'Banco baixo, pés à frente e torque de sobra para passear.' },
  { id: 'touring', type: 'moto', visible: true, name: 'Touring', short: 'Estrada longa', description: 'Proteção de vento, malas e conforto para dois em viagens.' },
  { id: 'hatch', type: 'carro', visible: true, name: 'Hatch', short: 'Compacto', description: 'Compactos e econômicos para a cidade.' },
  { id: 'sedan', type: 'carro', visible: true, name: 'Sedã', short: 'Porta-malas', description: 'Mais espaço para a família e para viajar.' },
  { id: 'suv', type: 'carro', visible: true, name: 'SUV', short: 'Utilitário', description: 'Posição de dirigir alta e versatilidade.' },
  { id: 'picape', type: 'carro', visible: true, name: 'Picape', short: 'Carga', description: 'Para o trabalho e para o lazer.' },
]

export const BRANDS = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'BMW', 'Triumph', 'Harley-Davidson', 'Royal Enfield', 'Dafra', 'Shineray', 'Haojue', 'Chevrolet', 'Fiat', 'Volkswagen', 'Ford', 'Toyota', 'Hyundai', 'Renault', 'Outra']
