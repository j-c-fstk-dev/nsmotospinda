import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEMO_LOGIN, DEMO_MODE, requestPasswordReset, signIn } from '../../lib/store'
import { LogoImg } from '../../components/Logo'

const COOLDOWN = 60

export default function AdminLogin() {
  const nav = useNavigate()
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [email, setEmail] = useState(DEMO_MODE ? DEMO_LOGIN.email : '')
  const [password, setPassword] = useState(DEMO_MODE ? DEMO_LOGIN.password : '')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [wait, setWait] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (wait <= 0) return
    const id = window.setTimeout(() => setWait((w) => w - 1), 1000)
    return () => window.clearTimeout(id)
  }, [wait])

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

  async function sendReset(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await requestPasswordReset(email)
      setSent(true)
      setWait(COOLDOWN)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar agora.')
    } finally {
      setBusy(false)
    }
  }

  const switchTo = (m: 'login' | 'reset') => {
    setMode(m)
    setError('')
    setSent(false)
  }

  return (
    <div className="login">
      <LogoImg height={112} className="login__logo" />
      {mode === 'login' ? (
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
          {error && (
            <p className="notice notice--error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
          <button type="button" className="link login__alt" onClick={() => switchTo('reset')}>
            Esqueci minha senha
          </button>
        </form>
      ) : (
        <form className="login__card" onSubmit={sendReset}>
          <h1>Recuperar senha</h1>
          {sent ? (
            <p className="notice" role="status">
              Se esse e-mail for o do painel, chega em alguns minutos um link para criar uma senha nova. O link vale por 1 hora e só funciona uma vez. Confira também a caixa de spam.
            </p>
          ) : (
            <p className="muted" style={{ margin: 0 }}>
              Digite o e-mail de acesso ao painel. Vamos enviar um link para você criar uma senha nova.
            </p>
          )}
          <label className="field">
            <span>E-mail</span>
            <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          {error && (
            <p className="notice notice--error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn--primary btn--block" disabled={busy || wait > 0}>
            {busy ? 'Enviando…' : wait > 0 ? `Enviar de novo em ${wait}s` : sent ? 'Enviar de novo' : 'Enviar link'}
          </button>
          <button type="button" className="link login__alt" onClick={() => switchTo('login')}>
            Voltar para o login
          </button>
        </form>
      )}
    </div>
  )
}
