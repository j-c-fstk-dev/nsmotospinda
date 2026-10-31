import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { DEMO_MODE, isSignedIn, resetDemo, signOut } from '../../lib/store'
import { useSite } from '../../lib/SiteContext'
import { LogoImg } from '../../components/Logo'

export default function AdminLayout() {
  const [state, setState] = useState<'checking' | 'in' | 'out'>('checking')
  const nav = useNavigate()
  const { pathname } = useLocation()
  const { reload } = useSite()

  useEffect(() => {
    isSignedIn().then((ok) => setState(ok ? 'in' : 'out'))
  }, [pathname])

  useEffect(() => {
    document.title = 'Painel | NS Multimarcas'
  }, [])

  if (state === 'checking') return <div className="admin-loading">Abrindo o painel…</div>
  if (state === 'out') return <Navigate to="/admin/login" replace />

  return (
    <div className="admin">
      <aside className="admin__side">
        <div className="admin__brand">
          <LogoImg height={40} />
        </div>
        <nav className="admin__nav" aria-label="Painel">
          <NavLink to="/admin" end>Resumo</NavLink>
          <NavLink to="/admin/veiculos" end>Veículos</NavLink>
          <NavLink to="/admin/veiculos/novo">Cadastrar veículo</NavLink>
          <NavLink to="/admin/loja">Dados da loja</NavLink>
          <NavLink to="/admin/google">Google e avaliações</NavLink>
        </nav>
        <div className="admin__foot">
          <a href="/" target="_blank" rel="noopener">Ver site</a>
          <button
            onClick={async () => {
              await signOut()
              nav('/admin/login')
            }}
          >
            Sair
          </button>
        </div>
      </aside>
      <div className="admin__main">
        {DEMO_MODE && (
          <div className="demo-bar">
            <span>Modo demonstração: as alterações ficam salvas só neste navegador.</span>
            <button
              onClick={async () => {
                if (!confirm('Voltar o estoque e os dados da loja para o exemplo original?')) return
                resetDemo()
                await reload()
              }}
            >
              Restaurar exemplo
            </button>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  )
}
