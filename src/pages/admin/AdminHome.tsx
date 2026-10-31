import { useEffect, useState } from 'react'
import { useSite } from '../../lib/SiteContext'
import { saveSettings } from '../../lib/store'
import { DEFAULT_SETTINGS } from '../../lib/seed'
import type { HowStep, StoreSettings } from '../../lib/types'
import { ArrowUpDown } from '../../components/Icons'

const MAX_STEPS = 6

export default function AdminHome() {
  const { settings, reload } = useSite()
  const [s, setS] = useState<StoreSettings>(settings)
  const [dirty, setDirty] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!dirty) setS(settings)
  }, [settings, dirty])

  const set = <K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) => {
    setS((p) => ({ ...p, [k]: v }))
    setDirty(true)
    setMsg('')
  }
  const steps = s.how_steps ?? []
  const setStep = (i: number, p: Partial<HowStep>) => set('how_steps', steps.map((x, j) => (j === i ? { ...x, ...p } : x)))
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= steps.length) return
    const next = [...steps]
    ;[next[i], next[j]] = [next[j], next[i]]
    set('how_steps', next)
  }

  async function save() {
    try {
      await saveSettings({ ...s, how_steps: steps.filter((x) => x.title.trim()) })
      await reload()
      setDirty(false)
      setMsg('Página inicial atualizada.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Não foi possível salvar.')
    }
  }

  return (
    <div className="admin__page">
      <header className="admin__head">
        <h1>Página inicial</h1>
        <button className="btn btn--primary" onClick={save} disabled={!dirty}>
          {dirty ? 'Salvar alterações' : 'Tudo salvo'}
        </button>
      </header>
      {msg && <p className="toast" role="status">{msg}</p>}

      <div className="aform">
        <fieldset>
          <legend>Como funciona a compra</legend>
          <label className="check">
            <input type="checkbox" checked={s.how_enabled !== false} onChange={(e) => set('how_enabled', e.target.checked)} />
            <span>Mostrar esta seção no site</span>
          </label>
          <label className="field">
            <span>Título da seção</span>
            <input value={s.how_title} maxLength={60} onChange={(e) => set('how_title', e.target.value)} />
          </label>
          <label className="field">
            <span>Texto de apoio</span>
            <textarea rows={2} maxLength={200} value={s.how_lead} placeholder="Opcional" onChange={(e) => set('how_lead', e.target.value)} />
          </label>

          <div className="field">
            <span>Etapas (aparecem nesta ordem)</span>
          </div>
          <ol className="steps-edit">
            {steps.map((st, i) => (
              <li key={i} className="steps-edit__item">
                <span className="frow__pos" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="steps-edit__fields">
                  <label className="field">
                    <span>Título da etapa {i + 1}</span>
                    <input value={st.title} maxLength={40} onChange={(e) => setStep(i, { title: e.target.value })} />
                  </label>
                  <label className="field">
                    <span>Texto</span>
                    <textarea rows={2} maxLength={160} value={st.text} onChange={(e) => setStep(i, { text: e.target.value })} />
                  </label>
                </div>
                <div className="steps-edit__actions">
                  <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir etapa ${i + 1}`}>
                    <ArrowUpDown dir="up" />
                  </button>
                  <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === steps.length - 1} aria-label={`Descer etapa ${i + 1}`}>
                    <ArrowUpDown dir="down" />
                  </button>
                  <button type="button" className="btn btn--danger btn--sm" onClick={() => set('how_steps', steps.filter((_, j) => j !== i))}>
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <div className="row">
            <button
              type="button"
              className="btn btn--ink btn--sm"
              disabled={steps.length >= MAX_STEPS}
              onClick={() => set('how_steps', [...steps, { title: '', text: '' }])}
            >
              Adicionar etapa
            </button>
            <button type="button" className="link" onClick={() => confirm('Voltar aos textos originais desta seção?') && (set('how_title', DEFAULT_SETTINGS.how_title), set('how_lead', DEFAULT_SETTINGS.how_lead), set('how_steps', DEFAULT_SETTINGS.how_steps))}>
              Restaurar textos originais
            </button>
          </div>
          <small className="muted">Até {MAX_STEPS} etapas. Etapa sem título não aparece no site. Com a seção escondida, o link "Como comprar" também sai do menu.</small>
        </fieldset>
      </div>
    </div>
  )
}
