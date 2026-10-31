import { Link } from 'react-router-dom'

// A marca é uma mini placa Mercosul: faixa azul em cima, "NS" no corpo.
export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <span className="logo-mark" style={{ width: size * 1.6, height: size }} aria-hidden="true">
      <span className="logo-mark__band" />
      <span className="logo-mark__text">NS</span>
    </span>
  )
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo--light' : ''}`} aria-label="NS Multimarcas, página inicial">
      <LogoMark size={34} />
      <span className="logo__words">
        <span className="logo__name">Multimarcas</span>
        <span className="logo__city">Pindamonhangaba</span>
      </span>
    </Link>
  )
}
