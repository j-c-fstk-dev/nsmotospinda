export type VehicleType = 'moto' | 'carro'
export type VehicleStatus = 'disponivel' | 'reservado' | 'vendido'

export interface Vehicle {
  id: string
  slug: string
  type: VehicleType
  category: string
  brand: string
  model: string
  version: string
  year_fab: number
  year_model: number
  km: number
  price: number
  promo_price: number | null
  promo_label: string
  color: string
  fuel: string
  displacement_cc: number | null
  description: string
  features: string[]
  images: string[]
  image_credit: string
  featured: boolean
  status: VehicleStatus
  created_at: string
}

export interface StoreSettings {
  store_name: string
  logo_url: string
  tagline: string
  whatsapp: string
  phone: string
  instagram: string
  facebook: string
  address: string
  neighborhood: string
  city: string
  maps_query: string
  google_profile_url: string
  google_review_url: string
  google_rating: number | null
  google_reviews_count: number | null
  hours: string[]
  announcement: string
  ga_id: string
  finance_rate_monthly: number
  warranty_text: string
}

export interface TrackEvent {
  id?: string
  kind: 'whatsapp' | 'view' | 'review'
  vehicle_id: string | null
  created_at?: string
}
