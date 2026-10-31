import { useEffect, useState, type FormEvent } from 'react'
import { useSite } from '../../lib/SiteContext'
import { saveSettings, uploadImage } from '../../lib/store'
import type { StoreSettings } from '../../lib/types'
import { installment, money } from '../../lib/format'

export default function AdminSettings() {
  const { settings, reload } = useSite()
  const [s, setS] = useState<StoreSettings>(settings)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const [rate, setRate] = useState(String(settings.finance_rate_monthly).replace('.', ','))
  useEffect(() => {
    setS(settings)
    setRate(String(settings.finance_rate_monthly).replace('.', ','))
  }, [settings])
  useEffect(() => {
    const n = Number(rate.replace(',', '.'))
    if (!Number.isNaN(n) && n >= 0 && n < 20) setS((p) => ({ ...p, finance_rate_monthly: n }))
  }, [rate])
  const exampleTerm = s.finance_terms.includes(36) ? 36 : s.finance_terms[s.finance_terms.length - 1] ?? 36
  const set = <K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) => setS((p) => ({ ...p, [k]: v }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!s.finance_terms.length) return setMsg('Escolha pelo menos um prazo para o simulador.')
    setBusy(true)
    try {
      await saveSettings(s)
      await reload()
      setMsg('Dados da loja salvos.')
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Não foi possível salvar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin__page">
      <header className="admin__head">
        <h1>Dados da loja</h1>
      </header>
      <form className="aform" onSubmit={submit}>
        <fieldset>
          <legend>Logo</legend>
          <div className="logo-edit">
            <img src={s.logo_url || '/emblem-ns.png'} alt="Logo atual" />
            <label className="btn btn--ghost btn--sm">
              Trocar logo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0]
                  if (f) set('logo_url', await uploadImage(f))
                }}
              />
            </label>
          </div>
          <small className="muted">Use uma imagem quadrada, com fundo preto ou transparente. Ela aparece no topo, no rodapé e no painel.</small>
        </fieldset>

        <fieldset>
          <legend>Contato</legend>
          <div className="aform__grid">
            <label className="field">
              <span>WhatsApp de vendas</span>
              <input value={s.whatsapp} placeholder="(12) 99999-9999" onChange={(e) => set('whatsapp', e.target.value)} />
            </label>
            <label className="field">
              <span>Telefone fixo ou segundo número</span>
              <input value={s.phone} placeholder="(12) 3333-3333" onChange={(e) => set('phone', e.target.value)} />
            </label>
            <label className="field">
              <span>Instagram (link)</span>
              <input type="url" value={s.instagram} onChange={(e) => set('instagram', e.target.value)} />
            </label>
            <label className="field">
              <span>Facebook (link)</span>
              <input type="url" value={s.facebook} onChange={(e) => set('facebook', e.target.value)} />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Endereço e horário</legend>
          <div className="aform__grid">
            <label className="field">
              <span>Rua e número</span>
              <input value={s.address} onChange={(e) => set('address', e.target.value)} />
            </label>
            <label className="field">
              <span>Bairro</span>
              <input value={s.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} />
            </label>
            <label className="field">
              <span>Cidade</span>
              <input value={s.city} onChange={(e) => set('city', e.target.value)} />
            </label>
            <label className="field">
              <span>Busca do mapa</span>
              <input value={s.maps_query} onChange={(e) => set('maps_query', e.target.value)} />
              <small>Como a loja aparece no Google Maps. Usado no mapa e no botão de rota.</small>
            </label>
          </div>
          <label className="field">
            <span>Horário de funcionamento (um por linha)</span>
            <textarea rows={3} value={s.hours.join('\n')} onChange={(e) => set('hours', e.target.value.split('\n').filter((l) => l.trim()))} />
          </label>
        </fieldset>

        <fieldset>
          <legend>Simulador de financiamento</legend>
          <label className="check">
            <input type="checkbox" checked={s.finance_enabled !== false} onChange={(e) => set('finance_enabled', e.target.checked)} />
            <span>Mostrar o simulador na página de cada moto</span>
          </label>
          <div className="aform__grid">
            <label className="field">
              <span>Taxa de juros (% ao mês)</span>
              <input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} onBlur={() => setRate(String(s.finance_rate_monthly).replace('.', ','))} />
              <small>Use a taxa média que o banco parceiro está aprovando.</small>
            </label>
            <label className="field">
              <span>Entrada sugerida (%)</span>
              <input inputMode="numeric" value={s.finance_down_pct ?? 30} onChange={(e) => set('finance_down_pct', Math.min(80, Number(e.target.value.replace(/\D/g, '')) || 0))} />
              <small>Valor inicial do controle de entrada.</small>
            </label>
          </div>
          <div className="field">
            <span>Prazos oferecidos</span>
            <div className="sim__terms" role="group" aria-label="Prazos oferecidos">
              {[6, 12, 18, 24, 36, 48, 60].map((t) => {
                const on = s.finance_terms.includes(t)
                return (
                  <button
                    type="button"
                    key={t}
                    className={`chip ${on ? 'chip--on' : ''}`}
                    aria-pressed={on}
                    onClick={() => set('finance_terms', on ? s.finance_terms.filter((x) => x !== t) : [...s.finance_terms, t].sort((a, b) => a - b))}
                  >
                    {t}x
                  </button>
                )
              })}
            </div>
          </div>
          <p className="notice">
            Exemplo: moto de {money(20000)} com {s.finance_down_pct ?? 30}% de entrada em {exampleTerm}x fica em{' '}
            <strong>{money(installment(20000 * (1 - (s.finance_down_pct ?? 30) / 100), s.finance_rate_monthly, exampleTerm))}</strong> por mês.
          </p>
        </fieldset>

        <fieldset>
          <legend>Avisos e textos</legend>
          <label className="field">
            <span>Faixa de aviso no topo do site</span>
            <input value={s.announcement} placeholder="Deixe vazio para esconder" maxLength={120} onChange={(e) => set('announcement', e.target.value)} />
          </label>
          <label className="field">
            <span>Texto da garantia</span>
            <textarea rows={2} value={s.warranty_text} onChange={(e) => set('warranty_text', e.target.value)} />
          </label>
          <div className="aform__grid">
            <label className="field">
              <span>Google Analytics (ID)</span>
              <input value={s.ga_id} placeholder="G-XXXXXXXXXX" onChange={(e) => set('ga_id', e.target.value.trim())} />
            </label>
          </div>
        </fieldset>

        {msg && <p className="toast" role="status">{msg}</p>}
        <div className="aform__actions">
          <button className="btn btn--primary" disabled={busy}>{busy ? 'Salvando…' : 'Salvar dados da loja'}</button>
        </div>
      </form>
    </div>
  )
}
