import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, cameFromRecoveryLink, RECOVERY_LINK_ERROR } from '../../lib/supabase'
import { DEMO_MODE, MIN_PASSWORD, updatePassword, verifyCurrentPassword } from '../../lib/store'
import { LogoImg } from '../../components/Logo'

type State = 'checking' | 'recovery' | 'signed-in' | 'invalid' | 'done'

/**
 * Duas entradas:
 * - pelo link do e-mail (recuperação): o Supabase valida o link de uso único
 *   e abre uma sessão temporária; não pede a senha antiga.
 * - logado no painel (trocar senha): pede a senha atual antes.
 */
export default function AdminNewPassword() {
  const nav = useNavigate()
  const [state, setState] = useState<State>('checking')
  const [current, setCurrent] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'Nova senha | NS Multimarcas'
    if (DEMO_MODE || !supabase) {
      setState('invalid')
      return
    }
    let alive = true
    // getSession espera o Supabase terminar de ler o link do e-mail
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return
      // tira qualquer token da barra de endereço e do histórico
      window.history.replaceState(null, '', window.location.pathname)
      if (RECOVERY_LINK_ERROR || !data.session) setState('invalid')
      else setState(cameFromRecoveryLink() ? 'recovery' : 'signed-in')
    })
    return () => {
      alive = false
    }
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (pw.length < MIN_PASSWORD) return setError(`Use pelo menos ${MIN_PASSWORD} caracteres.`)
    if (pw !== pw2) return setError('As duas senhas não são iguais.')
    setBusy(true)
    try {
      if (state === 'signed-in' && !(await verifyCurrentPassword(current))) throw new Error('A senha atual não confere.')
      await updatePassword(pw)
      setState('done')
      window.setTimeout(() => nav('/admin'), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível trocar a senha.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <LogoImg height={112} className="login__logo" />
      <div className="login__card">
        {state === 'checking' && <p className="muted">Conferindo o link…</p>}

        {state === 'invalid' && (
          <>
            <h1>Link inválido ou vencido</h1>
            <p className="muted" style={{ margin: 0 }}>
              {DEMO_MODE ? 'Na demonstração a senha é fixa. A recuperação funciona depois de ligar o banco de dados.' : 'O link de recuperação vale por 1 hora e só pode ser usado uma vez. Peça um novo na tela de login.'}
            </p>
            <Link to="/admin/login" className="btn btn--primary btn--block">
              Ir para o login
            </Link>
          </>
        )}

        {state === 'done' && (
          <>
            <h1>Senha alterada</h1>
            <p className="notice" role="status">
              Pronto. Outros aparelhos conectados foram desconectados. Abrindo o painel…
            </p>
          </>
        )}

        {(state === 'recovery' || state === 'signed-in') && (
          <form onSubmit={submit} style={{ display: 'contents' }}>
            <h1>{state === 'recovery' ? 'Criar senha nova' : 'Trocar senha'}</h1>
            {state === 'signed-in' && (
              <label className="field">
                <span>Senha atual</span>
                <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
              </label>
            )}
            <label className="field">
              <span>Senha nova</span>
              <input type="password" autoComplete="new-password" minLength={MIN_PASSWORD} value={pw} onChange={(e) => setPw(e.target.value)} required aria-describedby="pw-hint" />
              <small id="pw-hint">Pelo menos {MIN_PASSWORD} caracteres. Uma frase curta é mais fácil de lembrar e mais segura.</small>
            </label>
            <label className="field">
              <span>Repita a senha nova</span>
              <input type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} required />
            </label>
            {error && (
              <p className="notice notice--error" role="alert">
                {error}
              </p>
            )}
            <button className="btn btn--primary btn--block" disabled={busy}>
              {busy ? 'Salvando…' : 'Salvar senha nova'}
            </button>
            {state === 'signed-in' && (
              <Link to="/admin" className="link login__alt">
                Voltar ao painel
              </Link>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
