import { useEffect, useState, type FormEvent } from 'react'
import { useSite } from '../../lib/SiteContext'
import { saveSettings } from '../../lib/store'
import type { StoreSettings } from '../../lib/types'
import { reviewUrl, useQr, ReviewCard } from '../../components/ReviewCard'

export default function AdminGoogle() {
  const { settings, reload } = useSite()
  const [s, setS] = useState<StoreSettings>(settings)
  const [msg, setMsg] = useState('')
  useEffect(() => setS(settings), [settings])
  const set = <K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) => setS((p) => ({ ...p, [k]: v }))
  const qrBig = useQr(reviewUrl(s), 800)

  async function submit(e: FormEvent) {
    e.preventDefault()
    await saveSettings(s)
    await reload()
    setMsg('Dados do Google salvos.')
  }

  return (
    <div className="admin__page">
      <header className="admin__head">
        <h1>Google e avaliações</h1>
      </header>

      <form className="aform" onSubmit={submit}>
        <fieldset>
          <legend>Perfil da empresa no Google</legend>
          <ol className="howto">
            <li>No celular, abra o Google Maps logado na conta da loja e toque em <strong>Você → Seu perfil da empresa</strong>.</li>
            <li>Toque em <strong>Pedir avaliações</strong> e copie o link (algo como g.page/r/…/review).</li>
            <li>Cole abaixo. Para o link do perfil, toque em <strong>Compartilhar perfil</strong>.</li>
          </ol>
          <div className="aform__grid">
            <label className="field">
              <span>Link para avaliar</span>
              <input type="url" placeholder="https://g.page/r/.../review" value={s.google_review_url} onChange={(e) => set('google_review_url', e.target.value.trim())} />
            </label>
            <label className="field">
              <span>Link do perfil no Maps</span>
              <input type="url" placeholder="https://maps.app.goo.gl/..." value={s.google_profile_url} onChange={(e) => set('google_profile_url', e.target.value.trim())} />
            </label>
            <label className="field">
              <span>Nota atual no Google</span>
              <input inputMode="decimal" placeholder="Ex.: 4,8" value={s.google_rating ?? ''} onChange={(e) => set('google_rating', e.target.value ? Number(e.target.value.replace(',', '.')) : null)} />
              <small>Deixe vazio para não mostrar a nota.</small>
            </label>
            <label className="field">
              <span>Total de avaliações</span>
              <input inputMode="numeric" value={s.google_reviews_count ?? ''} onChange={(e) => set('google_reviews_count', e.target.value ? Number(e.target.value) : null)} />
            </label>
          </div>
          {!s.google_review_url && (
            <p className="notice">Sem o link oficial, os botões abrem a busca da loja no Google Maps. Funciona, mas o link direto leva a pessoa à tela de estrelas em um toque.</p>
          )}
        </fieldset>
        {msg && <p className="toast" role="status">{msg}</p>}
        <div className="aform__actions">
          <button className="btn btn--primary">Salvar</button>
        </div>
      </form>

      <h2 className="admin__h2">QR code para o balcão</h2>
      <p className="muted">Imprima e deixe no balcão ou entregue junto com a chave da moto.</p>
      {qrBig && (
        <div className="qr-print">
          <img src={qrBig} alt="QR code de avaliação" width={220} height={220} />
          <a className="btn btn--ghost" href={qrBig} download="avaliar-ns-multimarcas.png">Baixar QR code</a>
        </div>
      )}

      <h2 className="admin__h2">Como aparece no site</h2>
      <ReviewCard settings={s} />
    </div>
  )
}
