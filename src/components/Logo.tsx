import { Link } from 'react-router-dom'
import { useSite } from '../lib/SiteContext'

export function LogoImg({ height = 46, className = 'logo-img' }: { height?: number; className?: string }) {
  const { settings } = useSite()
  return <img src={settings.logo_url || '/logo-ns.png'} alt="NS Multimarcas" className={className} style={{ height }} />
}

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="NS Multimarcas, página inicial">
      <LogoImg />
    </Link>
  )
}
