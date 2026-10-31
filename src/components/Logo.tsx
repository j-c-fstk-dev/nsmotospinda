import { Link } from 'react-router-dom'
import { useSite } from '../lib/SiteContext'

// Emblema oficial da loja (o mesmo da parede do showroom)
export function LogoImg({ height = 52, className = 'logo-img' }: { height?: number; className?: string }) {
  const { settings } = useSite()
  return <img src={settings.logo_url || '/emblem-ns.png'} alt="" className={className} style={{ height, width: height }} onError={(e) => {
    if (!e.currentTarget.src.endsWith('/emblem-ns.png')) e.currentTarget.src = '/emblem-ns.png'
  }} />
}

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="NS Multimarcas, página inicial">
      <LogoImg />
      <span className="logo__words">
        <span className="logo__name">NS Multimarcas</span>
        <span className="logo__city">Pindamonhangaba</span>
      </span>
    </Link>
  )
}
