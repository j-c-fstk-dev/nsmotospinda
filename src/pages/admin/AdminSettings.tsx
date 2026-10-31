import { useEffect, useState, type FormEvent } from 'react'
import { useSite } from '../../lib/SiteContext'
import { saveSettings } from '../../lib/store'
import type { StoreSettings } from '../../lib/types'

export default function AdminSettings() {
  const { settings, reload } = useSite()
  const [s, setS] = useState<StoreSettings>(settings)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => setS(settings), [settings])
  const set = <K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) => setS((p) => ({ ...p, [k]: v }))

  async function submit(e: FormEvent) {
    e.preventDefault()
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
          <legend>Contato</legend>
          <div className="aform__grid">
            <label className="field">
              <span>WhatsApp de vendas</span>
              <input value={s.whatsapp} placeholder="(12) 99999-9999" onChange={(e) => set('whatsapp', e.target.value)} />
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
              <span>Taxa do simulador (% ao mês)</span>
              <input inputMode="decimal" value={s.finance_rate_monthly} onChange={(e) => set('finance_rate_monthly', Number(e.target.value.replace(',', '.')) || 0)} />
            </label>
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
