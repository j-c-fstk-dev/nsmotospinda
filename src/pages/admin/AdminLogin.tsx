import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEMO_LOGIN, DEMO_MODE, signIn } from '../../lib/store'
import { LogoImg } from '../../components/Logo'

export default function AdminLogin() {
  const nav = useNavigate()
  const [email, setEmail] = useState(DEMO_MODE ? DEMO_LOGIN.email : '')
  const [password, setPassword] = useState(DEMO_MODE ? DEMO_LOGIN.password : '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email, password)
      nav('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <LogoImg height={64} className="login__logo" />
      <form className="login__card" onSubmit={submit}>
        <h1>Entrar no painel</h1>
        {DEMO_MODE && <p className="notice">Demonstração: os dados de acesso já estão preenchidos.</p>}
        <label className="field">
          <span>E-mail</span>
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Senha</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="notice notice--error" role="alert">{error}</p>}
        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
