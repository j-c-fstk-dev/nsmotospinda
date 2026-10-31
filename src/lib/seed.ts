import type { StoreSettings, Vehicle } from './types'
import { slugify } from './format'

// Fotos de demonstração: Wikimedia Commons (licenças livres, crédito no anúncio).
// Na versão final, o lojista sobe as fotos reais pelo painel.
const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=1280`

type SeedInput = Omit<Vehicle, 'id' | 'slug' | 'created_at' | 'promo_price' | 'promo_label' | 'featured' | 'status' | 'features' | 'type' | 'fuel' | 'description' | 'version'> &
  Partial<Pick<Vehicle, 'promo_price' | 'promo_label' | 'featured' | 'status' | 'features' | 'fuel' | 'description' | 'version'>>

const BASE_FEATURES = ['Revisada na loja', 'Garantia de 90 dias', 'Documentação em dia', 'Manual e chave reserva']

const raw: SeedInput[] = [
  // Street
  { category: 'street', brand: 'Honda', model: 'CG 150 Titan Mix', year_fab: 2014, year_model: 2015, km: 38500, price: 10900, color: 'Vermelha', displacement_cc: 149, images: [commons('Moto_Honda_Flex_Titan_CG_150_Mix_Fuel_Injection_06_2009_Itu.jpg')], image_credit: 'Foto: Wikimedia Commons', fuel: 'Flex', featured: true, description: 'A moto mais vendida do Brasil. Flex, econômica e com peça em qualquer lugar.' },
  { category: 'street', brand: 'Honda', model: 'CBX 250 Twister', year_fab: 2007, year_model: 2008, km: 52300, price: 9800, color: 'Preta', displacement_cc: 249, images: [commons('HONDA_CBX_250_TWISTER.jpg')], image_credit: 'Foto: Wikimedia Commons', promo_price: 8990, promo_label: 'Preço de feirão' },
  { category: 'street', brand: 'Honda', model: 'CB 300F Twister', year_fab: 2023, year_model: 2024, km: 9200, price: 21900, color: 'Vermelha', displacement_cc: 293, images: [commons('HondaCB300F.jpg')], image_credit: 'Foto: Wikimedia Commons', fuel: 'Flex', featured: true },
  // Trail
  { category: 'trail', brand: 'Honda', model: 'XRE 300', version: 'ABS', year_fab: 2019, year_model: 2020, km: 27400, price: 21500, color: 'Branca', displacement_cc: 291, images: [commons('Honda_XRE300_ano2010.jpg')], image_credit: 'Foto: Wikimedia Commons (domínio público)', fuel: 'Flex', featured: true },
  { category: 'trail', brand: 'Honda', model: 'NXR 150 Bros', year_fab: 2013, year_model: 2014, km: 41800, price: 11500, color: 'Prata', displacement_cc: 149, images: [commons('Honda_NXR_150_Bros_01.jpg')], image_credit: 'Foto: Wikimedia Commons', fuel: 'Flex' },
  { category: 'trail', brand: 'Yamaha', model: 'XTZ 250 Lander', year_fab: 2018, year_model: 2018, km: 33100, price: 15900, color: 'Azul', displacement_cc: 249, images: [commons('YamahaXTZLander250.JPG')], image_credit: 'Foto: Wikimedia Commons', fuel: 'Flex', promo_price: 14900, promo_label: 'Entrada no cartão' },
  // Scooter
  { category: 'scooter', brand: 'Honda', model: 'PCX 160', version: 'DLX ABS', year_fab: 2022, year_model: 2023, km: 12600, price: 19900, color: 'Branca', displacement_cc: 156, images: [commons('2021_Honda_PCX_160_Standard.jpg')], image_credit: 'Foto: Wikimedia Commons', featured: true },
  { category: 'scooter', brand: 'Yamaha', model: 'NMAX 160', version: 'ABS', year_fab: 2021, year_model: 2021, km: 18900, price: 17400, color: 'Cinza', displacement_cc: 155, images: [commons('Yamaha_NMAX_155.jpg')], image_credit: 'Foto: Wikimedia Commons' },
  { category: 'scooter', brand: 'Honda', model: 'ADV 150', year_fab: 2021, year_model: 2022, km: 15400, price: 18700, color: 'Vermelha', displacement_cc: 149, images: [commons('Honda_ADV150_in_KISSA_Commonplace_-_Jambi_City,_JA.jpg')], image_credit: 'Foto: Firzafp / Wikimedia Commons (CC BY 4.0)', status: 'reservado' },
  // Naked
  { category: 'naked', brand: 'Yamaha', model: 'MT-03', version: 'ABS', year_fab: 2021, year_model: 2022, km: 14200, price: 27900, color: 'Azul', displacement_cc: 321, images: [commons('YAMAHA_MT-03_at_the_Tokyo_Motor_Show_2015.jpg')], image_credit: 'Foto: Wikimedia Commons', featured: true, promo_price: 26490, promo_label: 'Baixou' },
  { category: 'naked', brand: 'Kawasaki', model: 'Z400', year_fab: 2020, year_model: 2020, km: 19800, price: 28500, color: 'Verde', displacement_cc: 399, images: [commons('Z400_2020.jpg')], image_credit: 'Foto: Wikimedia Commons (CC BY-SA 4.0)' },
  { category: 'naked', brand: 'Honda', model: 'CB 500F', year_fab: 2021, year_model: 2021, km: 22600, price: 32900, color: 'Vermelha', displacement_cc: 471, images: [commons('2021_Honda_CB500F.jpg')], image_credit: 'Foto: Chanokchon / Wikimedia Commons (CC BY-SA 4.0)' },
  // Esportiva
  { category: 'esportiva', brand: 'Yamaha', model: 'YZF-R3', version: 'ABS', year_fab: 2022, year_model: 2022, km: 11300, price: 31500, color: 'Azul', displacement_cc: 321, images: [commons('Yamaha_YZF-R3_2022_v1.jpg')], image_credit: 'Foto: Kuro202 / Wikimedia Commons (CC BY-SA 4.0)', featured: true },
  { category: 'esportiva', brand: 'Kawasaki', model: 'Ninja 400', year_fab: 2019, year_model: 2019, km: 24700, price: 29900, color: 'Verde', displacement_cc: 399, images: [commons('Kawasaki_Ninja_400.jpg')], image_credit: 'Foto: Wikimedia Commons (CC BY-SA 4.0)' },
  { category: 'esportiva', brand: 'Honda', model: 'CBR 650R', year_fab: 2020, year_model: 2021, km: 17800, price: 52900, color: 'Vermelha', displacement_cc: 649, images: [commons('Honda_CBR_650R.jpg')], image_credit: 'Foto: Wikimedia Commons (CC BY 4.0)', fuel: 'Gasolina' },
  // Big Trail
  { category: 'big-trail', brand: 'Honda', model: 'NC 750X', version: 'DCT', year_fab: 2017, year_model: 2017, km: 36200, price: 41900, color: 'Vermelha', displacement_cc: 745, images: [commons('2017_Honda_NC750X.jpg')], image_credit: 'Foto: Carsamar / Wikimedia Commons', fuel: 'Gasolina' },
  { category: 'big-trail', brand: 'BMW', model: 'F 850 GS', year_fab: 2018, year_model: 2019, km: 31400, price: 59900, color: 'Branca', displacement_cc: 853, images: [commons('BMW_F_850_GS,_Baujahr_2018_(2019-04-14).jpg')], image_credit: 'Foto: Stuetze9 / Wikimedia Commons (CC BY-SA 4.0)', fuel: 'Gasolina', featured: true },
  { category: 'big-trail', brand: 'Triumph', model: 'Tiger 900 GT Pro', year_fab: 2022, year_model: 2022, km: 15900, price: 74900, color: 'Branca', displacement_cc: 888, images: [commons('Triumph_Tiger_900_GT_Pro_(1).jpg')], image_credit: 'Foto: Wikimedia Commons', fuel: 'Gasolina' },
  // Custom
  { category: 'custom', brand: 'Harley-Davidson', model: 'Sportster Iron 883', year_fab: 2016, year_model: 2016, km: 21200, price: 46900, color: 'Preta fosca', displacement_cc: 883, images: [commons('Harley-davidson-sportster-iron-883.jpg')], image_credit: 'Foto: Wikimedia Commons (CC BY-SA 2.0)', fuel: 'Gasolina', featured: true },
  { category: 'custom', brand: 'Yamaha', model: 'Bolt 950', year_fab: 2015, year_model: 2015, km: 28400, price: 38900, color: 'Cinza', displacement_cc: 942, images: [commons('2014_Yamaha_Star_Bolt_2014-07-15_03-04.jpg')], image_credit: 'Foto: Wikimedia Commons', fuel: 'Gasolina' },
  { category: 'custom', brand: 'Honda', model: 'Shadow 750', year_fab: 2011, year_model: 2011, km: 44600, price: 27900, color: 'Preta', displacement_cc: 745, images: [commons('Honda_VT750S_Shadow_2011.jpg')], image_credit: 'Foto: Khaosaming / Wikimedia Commons', fuel: 'Gasolina', promo_price: 25900, promo_label: 'Último do mês' },
  // Touring
  { category: 'touring', brand: 'Honda', model: 'Gold Wing GL 1800', version: 'Tour DCT', year_fab: 2018, year_model: 2018, km: 29800, price: 139900, color: 'Prata', displacement_cc: 1833, images: [commons('Honda_Gold_Wing_GL_1800_(SC79_-_2018).jpg')], image_credit: 'Foto: Wikimedia Commons (CC BY-SA 4.0)', fuel: 'Gasolina' },
  { category: 'touring', brand: 'Harley-Davidson', model: 'Street Glide 103', year_fab: 2016, year_model: 2016, km: 34500, price: 89900, color: 'Preta', displacement_cc: 1690, images: [commons('Harley_davidson_street_glide_103.jpg')], image_credit: 'Foto: Harleyrobbio / Wikimedia Commons (CC BY-SA 4.0)', fuel: 'Gasolina' },
  { category: 'touring', brand: 'BMW', model: 'R 1200 RT', year_fab: 2017, year_model: 2017, km: 47300, price: 74500, color: 'Azul', displacement_cc: 1170, images: [commons('BMW_R_1200_RT_2017.jpg')], image_credit: 'Foto: Wikimedia Commons', fuel: 'Gasolina' },
]

export const SEED_VEHICLES: Vehicle[] = raw.map((r, i) => {
  const slug = slugify(`${r.brand} ${r.model} ${r.year_model} ${i + 1}`)
  return {
    id: `seed-${i + 1}`,
    slug,
    type: 'moto',
    version: '',
    fuel: 'Gasolina',
    description: '',
    features: BASE_FEATURES,
    promo_price: null,
    promo_label: '',
    featured: false,
    status: 'disponivel',
    created_at: new Date(Date.UTC(2026, 9, 30 - i)).toISOString(),
    ...r,
  }
})

export const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'NS Multimarcas',
  tagline: 'Motos e carros seminovos em Pindamonhangaba',
  whatsapp: '(12) 99999-0000',
  phone: '',
  instagram: 'https://www.instagram.com/multimarcas.ns23/',
  facebook: 'https://www.facebook.com/p/NSMultimarcas-61586905566212/',
  address: 'Rua Doutor Campos Salles, 271',
  neighborhood: 'Centro',
  city: 'Pindamonhangaba - SP',
  maps_query: 'NS Multimarcas, Rua Doutor Campos Salles, 271, Pindamonhangaba - SP',
  google_profile_url: '',
  google_review_url: '',
  google_rating: null,
  google_reviews_count: null,
  hours: ['Segunda a sexta: 8h às 18h', 'Sábado: 8h às 13h'],
  announcement: 'Entrada parcelada no cartão em até 12x. Avaliamos sua moto na troca.',
  ga_id: '',
  finance_rate_monthly: 1.99,
  warranty_text: 'Todas as motos passam por revisão na loja e saem com 90 dias de garantia de motor e câmbio.',
}
