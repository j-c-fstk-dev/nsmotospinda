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
  /** posição nos destaques (menor aparece primeiro) */
  featured_rank: number
  hidden: boolean
  promo_until: string
  status: VehicleStatus
  created_at: string
}

export interface Category {
  id: string
  name: string
  short: string
  description: string
  type: VehicleType
  visible: boolean
}

export interface HowStep {
  title: string
  text: string
}

export type TextItem = HowStep

export interface StoreSettings {
  hero_title: string
  hero_lead: string
  hero_cta_label: string
  services_enabled: boolean
  services_title: string
  services_items: TextItem[]
  services_cta_label: string
  services_cta_message: string
  cats_title: string
  cats_text: string
  featured_title: string
  offers_title: string
  offers_text: string
  visit_title: string
  how_enabled: boolean
  how_title: string
  how_lead: string
  how_steps: HowStep[]
  categories: Category[]
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
  announcement_enabled: boolean
  announcement_link: string
  ga_id: string
  finance_rate_monthly: number
  finance_terms: number[]
  finance_down_pct: number
  finance_enabled: boolean
  warranty_text: string
}

export interface TrackEvent {
  id?: string
  kind: 'whatsapp' | 'view' | 'review'
  vehicle_id: string | null
  created_at?: string
}
