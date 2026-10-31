import { Link } from 'react-router-dom'
import { usePageTitle } from '../lib/SiteContext'

export default function NotFound() {
  usePageTitle('Página não encontrada')
  return (
    <section className="section">
      <div className="wrap empty">
        <h1 className="section__title">Essa página não existe mais</h1>
        <p>Talvez o veículo já tenha sido vendido. Veja o que está disponível agora.</p>
        <Link to="/estoque" className="btn btn--primary">Ver estoque</Link>
      </div>
    </section>
  )
}
