import { useEffect, useState } from 'react'
import { useSite } from '../../lib/SiteContext'
import { saveSettings } from '../../lib/store'
import { DEFAULT_SETTINGS } from '../../lib/seed'
import type { StoreSettings, TextItem } from '../../lib/types'
import { ArrowUpDown } from '../../components/Icons'

/** Lista editável de itens com título e texto (etapas, serviços) */
function ItemsEditor({ items, onChange, max, noun, of }: { items: TextItem[]; onChange: (v: TextItem[]) => void; max: number; noun: string; of: string }) {
  const setItem = (i: number, p: Partial<TextItem>) => onChange(items.map((x, j) => (j === i ? { ...x, ...p } : x)))
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  return (
    <>
      <ol className="steps-edit">
        {items.map((it, i) => (
          <li key={i} className="steps-edit__item">
            <span className="frow__pos" aria-hidden="true">
              {i + 1}
            </span>
            <div className="steps-edit__fields">
              <label className="field">
                <span>
                  Título {of} {noun} {i + 1}
                </span>
                <input value={it.title} maxLength={40} onChange={(e) => setItem(i, { title: e.target.value })} />
              </label>
              <label className="field">
                <span>Texto</span>
                <textarea rows={2} maxLength={160} value={it.text} onChange={(e) => setItem(i, { text: e.target.value })} />
              </label>
            </div>
            <div className="steps-edit__actions">
              <button type="button" className="icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir ${noun} ${i + 1}`}>
                <ArrowUpDown dir="up" />
              </button>
              <button type="button" className="icon-btn" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Descer ${noun} ${i + 1}`}>
                <ArrowUpDown dir="down" />
              </button>
              <button type="button" className="btn btn--danger btn--sm" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ol>
      <div className="row">
        <button type="button" className="btn btn--ink btn--sm" disabled={items.length >= max} onClick={() => onChange([...items, { title: '', text: '' }])}>
          Adicionar {noun}
        </button>
      </div>
      <small className="muted">Até {max}. Item sem título não aparece no site.</small>
    </>
  )
}

type Key = keyof StoreSettings

export default function AdminHome() {
  const { settings, reload } = useSite()
  const [s, setS] = useState<StoreSettings>(settings)
  const [dirty, setDirty] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!dirty) setS(settings)
  }, [settings, dirty])

  const set = <K extends Key>(k: K, v: StoreSettings[K]) => {
    setS((p) => ({ ...p, [k]: v }))
    setDirty(true)
    setMsg('')
  }
  const restore = (keys: Key[], what: string) => {
    if (!confirm(`Voltar ${what} aos textos originais?`)) return
    setS((p) => ({ ...p, ...Object.fromEntries(keys.map((k) => [k, DEFAULT_SETTINGS[k]])) }))
    setDirty(true)
  }

  // campo de texto simples ligado a uma chave
  const text = (k: Key, label: string, opts: { max?: number; area?: boolean; hint?: string; placeholder?: string } = {}) => (
    <label className="field">
      <span>{label}</span>
      {opts.area ? (
        <textarea rows={2} maxLength={opts.max} placeholder={opts.placeholder} value={String(s[k] ?? '')} onChange={(e) => set(k, e.target.value as never)} />
      ) : (
        <input maxLength={opts.max} placeholder={opts.placeholder} value={String(s[k] ?? '')} onChange={(e) => set(k, e.target.value as never)} />
      )}
      {opts.hint && <small>{opts.hint}</small>}
    </label>
  )

  async function save() {
    if (!s.hero_title.trim()) return setMsg('O título do topo não pode ficar vazio.')
    try {
      await saveSettings({
        ...s,
        how_steps: (s.how_steps ?? []).filter((x) => x.title.trim()),
        services_items: (s.services_items ?? []).filter((x) => x.title.trim()),
      })
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
      <p className="muted" style={{ marginTop: -8 }}>
        Os textos aparecem na ordem da página. Nada muda no site até você salvar.
      </p>
      {msg && <p className="toast" role="status">{msg}</p>}

      <div className="aform">
        <fieldset>
          <legend>Topo do site</legend>
          {text('hero_title', 'Título principal', { max: 40, hint: 'Curto: cabe em até duas linhas. Ex.: "Moto revisada e com garantia."' })}
          {text('hero_lead', 'Texto embaixo do título', { max: 160, area: true })}
          {text('hero_cta_label', 'Texto do botão dourado', { max: 24, hint: 'Leva para o estoque.' })}
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>
            A foto do topo é a do primeiro veículo em Destaques.
          </p>
          <div className="row">
            <button type="button" className="link" onClick={() => restore(['hero_title', 'hero_lead', 'hero_cta_label'], 'o topo')}>
              Restaurar textos originais
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Serviços</legend>
          <label className="check">
            <input type="checkbox" checked={s.services_enabled !== false} onChange={(e) => set('services_enabled', e.target.checked)} />
            <span>Mostrar esta seção no site</span>
          </label>
          {text('services_title', 'Título da seção', { max: 60 })}
          {text('warranty_text', 'Texto de apoio', { max: 200, area: true, hint: 'Bom lugar para falar da revisão e da garantia.' })}
          <div className="field">
            <span>Serviços</span>
          </div>
          <ItemsEditor items={s.services_items ?? []} onChange={(v) => set('services_items', v)} max={9} noun="serviço" of="do" />
          <div className="aform__grid aform__grid--wide">
            {text('services_cta_label', 'Link no último serviço', { max: 32, hint: 'Abre o WhatsApp. Deixe vazio para esconder.' })}
            {text('services_cta_message', 'Mensagem que já vai escrita no WhatsApp', { max: 200, area: true })}
          </div>
          <div className="row">
            <button
              type="button"
              className="link"
              onClick={() => restore(['services_title', 'warranty_text', 'services_items', 'services_cta_label', 'services_cta_message'], 'os serviços')}
            >
              Restaurar textos originais
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Títulos das vitrines</legend>
          <div className="aform__grid aform__grid--wide">
            {text('cats_title', 'Categorias: título', { max: 40 })}
            {text('cats_text', 'Categorias: texto', { max: 120, placeholder: 'Opcional' })}
            {text('featured_title', 'Destaques: título', { max: 40 })}
            {text('offers_title', 'Ofertas: título', { max: 40 })}
            {text('offers_text', 'Ofertas: texto', { max: 120, placeholder: 'Opcional' })}
            {text('visit_title', 'Endereço e mapa: título', { max: 40 })}
          </div>
          <div className="row">
            <button
              type="button"
              className="link"
              onClick={() => restore(['cats_title', 'cats_text', 'featured_title', 'offers_title', 'offers_text', 'visit_title'], 'os títulos')}
            >
              Restaurar textos originais
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Como funciona a compra</legend>
          <label className="check">
            <input type="checkbox" checked={s.how_enabled !== false} onChange={(e) => set('how_enabled', e.target.checked)} />
            <span>Mostrar esta seção no site</span>
          </label>
          {text('how_title', 'Título da seção', { max: 60 })}
          {text('how_lead', 'Texto de apoio', { max: 200, area: true, placeholder: 'Opcional' })}
          <div className="field">
            <span>Etapas (aparecem nesta ordem)</span>
          </div>
          <ItemsEditor items={s.how_steps ?? []} onChange={(v) => set('how_steps', v)} max={6} noun="etapa" of="da" />
          <small className="muted">Com a seção escondida, o link "Como comprar" também sai do menu.</small>
          <div className="row">
            <button type="button" className="link" onClick={() => restore(['how_title', 'how_lead', 'how_steps'], 'esta seção')}>
              Restaurar textos originais
            </button>
          </div>
        </fieldset>
      </div>
    </div>
  )
}
