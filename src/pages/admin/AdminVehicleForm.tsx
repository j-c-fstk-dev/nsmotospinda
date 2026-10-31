import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSite } from '../../lib/SiteContext'
import { saveVehicle, uploadImage } from '../../lib/store'
import type { Vehicle } from '../../lib/types'
import { BRANDS, CAR_CATEGORIES, MOTO_CATEGORIES } from '../../lib/categories'
import { slugify } from '../../lib/format'
import { VehicleImage } from '../../components/VehicleImage'

const EMPTY: Vehicle = {
  id: '',
  slug: '',
  type: 'moto',
  category: 'street',
  brand: 'Honda',
  model: '',
  version: '',
  year_fab: new Date().getFullYear(),
  year_model: new Date().getFullYear(),
  km: 0,
  price: 0,
  promo_price: null,
  promo_label: '',
  color: '',
  fuel: 'Flex',
  displacement_cc: null,
  description: '',
  features: ['Revisada na loja', 'Garantia de 90 dias', 'Documentação em dia'],
  images: [],
  image_credit: '',
  featured: false,
  status: 'disponivel',
  created_at: '',
}

export default function AdminVehicleForm() {
  const { id } = useParams()
  const nav = useNavigate()
  const { vehicles, reload } = useSite()
  const existing = vehicles.find((v) => v.id === id)
  const [v, setV] = useState<Vehicle>(existing ?? EMPTY)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState('')
  const [urlInput, setUrlInput] = useState('')

  useEffect(() => {
    if (existing) setV(existing)
  }, [existing?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Vehicle>(k: K, val: Vehicle[K]) => setV((p) => ({ ...p, [k]: val }))
  const num = (s: string) => (s === '' ? 0 : Number(s.replace(/\D/g, '')))
  const cats = v.type === 'moto' ? MOTO_CATEGORIES : CAR_CATEGORIES

  async function addFiles(files: FileList | null) {
    if (!files?.length) return
    setError('')
    setUploading(files.length)
    try {
      for (const f of Array.from(files)) {
        const url = await uploadImage(f)
        setV((p) => ({ ...p, images: [...p.images, url] }))
        setUploading((n) => n - 1)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao enviar foto.')
    } finally {
      setUploading(0)
    }
  }

  const moveImg = (i: number, d: -1 | 1) =>
    setV((p) => {
      const imgs = [...p.images]
      const j = i + d
      if (j < 0 || j >= imgs.length) return p
      ;[imgs[i], imgs[j]] = [imgs[j], imgs[i]]
      return { ...p, images: imgs }
    })

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!v.model.trim()) return setError('Preencha o modelo.')
    if (!v.price) return setError('Preencha o preço.')
    if (v.promo_price && v.promo_price >= v.price) return setError('O preço de oferta precisa ser menor que o preço normal.')
    setBusy(true)
    setError('')
    try {
      const slug = v.slug || `${slugify(`${v.brand} ${v.model} ${v.year_model}`)}-${Math.random().toString(36).slice(2, 6)}`
      await saveVehicle({ ...v, slug })
      await reload()
      nav('/admin/veiculos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin__page">
      <header className="admin__head">
        <h1>{existing ? `Editar ${existing.brand} ${existing.model}` : 'Cadastrar veículo'}</h1>
      </header>

      <form className="aform" onSubmit={submit}>
        <fieldset>
          <legend>Fotos</legend>
          <p className="muted">A primeira foto é a capa do anúncio. Fotos do celular são reduzidas automaticamente.</p>
          <div className="aimgs">
            {v.images.map((src, i) => (
              <div key={src.slice(-40) + i} className="aimg">
                <VehicleImage src={src} alt={`Foto ${i + 1}`} />
                <div className="aimg__bar">
                  <button type="button" onClick={() => moveImg(i, -1)} disabled={i === 0} aria-label="Mover para a esquerda">‹</button>
                  <span>{i === 0 ? 'Capa' : i + 1}</span>
                  <button type="button" onClick={() => moveImg(i, 1)} disabled={i === v.images.length - 1} aria-label="Mover para a direita">›</button>
                  <button type="button" onClick={() => set('images', v.images.filter((_, j) => j !== i))} aria-label="Remover foto">✕</button>
                </div>
              </div>
            ))}
            <label className="aimg aimg--add">
              <input type="file" accept="image/*" multiple onChange={(e) => addFiles(e.target.files)} />
              <span>{uploading ? `Enviando ${uploading}…` : 'Adicionar fotos'}</span>
            </label>
          </div>
          <div className="row">
            <input type="url" placeholder="Ou cole o link de uma imagem" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} aria-label="Link da imagem" />
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                if (urlInput) set('images', [...v.images, urlInput])
                setUrlInput('')
              }}
            >
              Adicionar link
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend>Veículo</legend>
          <div className="aform__grid">
            <label className="field">
              <span>Tipo</span>
              <select value={v.type} onChange={(e) => setV((p) => ({ ...p, type: e.target.value as Vehicle['type'], category: e.target.value === 'moto' ? 'street' : 'hatch' }))}>
                <option value="moto">Moto</option>
                <option value="carro">Carro</option>
              </select>
            </label>
            <label className="field">
              <span>Categoria</span>
              <select value={v.category} onChange={(e) => set('category', e.target.value)}>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}: {c.short}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Marca</span>
              <input list="brands" value={v.brand} onChange={(e) => set('brand', e.target.value)} required />
              <datalist id="brands">{BRANDS.map((b) => <option key={b} value={b} />)}</datalist>
            </label>
            <label className="field">
              <span>Modelo</span>
              <input value={v.model} placeholder="Ex.: XRE 300" onChange={(e) => set('model', e.target.value)} required />
            </label>
            <label className="field">
              <span>Versão</span>
              <input value={v.version} placeholder="Ex.: ABS, Rally, DLX" onChange={(e) => set('version', e.target.value)} />
            </label>
            <label className="field">
              <span>Cor</span>
              <input value={v.color} onChange={(e) => set('color', e.target.value)} />
            </label>
            <label className="field">
              <span>Ano de fabricação</span>
              <input inputMode="numeric" value={v.year_fab || ''} onChange={(e) => set('year_fab', num(e.target.value))} />
            </label>
            <label className="field">
              <span>Ano do modelo</span>
              <input inputMode="numeric" value={v.year_model || ''} onChange={(e) => set('year_model', num(e.target.value))} />
            </label>
            <label className="field">
              <span>Quilometragem</span>
              <input inputMode="numeric" value={v.km || ''} onChange={(e) => set('km', num(e.target.value))} />
            </label>
            <label className="field">
              <span>Cilindrada (cc)</span>
              <input inputMode="numeric" value={v.displacement_cc ?? ''} onChange={(e) => set('displacement_cc', e.target.value ? num(e.target.value) : null)} />
            </label>
            <label className="field">
              <span>Combustível</span>
              <select value={v.fuel} onChange={(e) => set('fuel', e.target.value)}>
                {['Flex', 'Gasolina', 'Elétrica', 'Diesel'].map((f) => <option key={f}>{f}</option>)}
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Preço e oferta</legend>
          <div className="aform__grid">
            <label className="field">
              <span>Preço (R$)</span>
              <input inputMode="numeric" value={v.price || ''} onChange={(e) => set('price', num(e.target.value))} required />
            </label>
            <label className="field">
              <span>Preço de oferta (R$)</span>
              <input inputMode="numeric" placeholder="Deixe vazio se não estiver em oferta" value={v.promo_price ?? ''} onChange={(e) => set('promo_price', e.target.value ? num(e.target.value) : null)} />
            </label>
            <label className="field">
              <span>Selo da oferta</span>
              <input placeholder="Ex.: Baixou, Feirão, Último do mês" maxLength={24} value={v.promo_label} onChange={(e) => set('promo_label', e.target.value)} />
            </label>
          </div>
          <div className="aform__checks">
            <label className="check">
              <input type="checkbox" checked={v.featured} onChange={(e) => set('featured', e.target.checked)} />
              <span>Mostrar nos destaques da página inicial</span>
            </label>
            <label className="field field--inline">
              <span>Situação</span>
              <select value={v.status} onChange={(e) => set('status', e.target.value as Vehicle['status'])}>
                <option value="disponivel">Disponível</option>
                <option value="reservado">Reservada</option>
                <option value="vendido">Vendida</option>
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Anúncio</legend>
          <label className="field">
            <span>Descrição</span>
            <textarea rows={4} placeholder="Estado de conservação, revisões feitas, acessórios, único dono…" value={v.description} onChange={(e) => set('description', e.target.value)} />
          </label>
          <label className="field">
            <span>Itens inclusos (um por linha)</span>
            <textarea rows={4} value={v.features.join('\n')} onChange={(e) => set('features', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))} />
          </label>
          <label className="field">
            <span>Crédito das fotos (opcional)</span>
            <input value={v.image_credit} onChange={(e) => set('image_credit', e.target.value)} />
          </label>
        </fieldset>

        {error && <p className="notice notice--error" role="alert">{error}</p>}
        <div className="aform__actions">
          <button type="button" className="btn btn--ghost" onClick={() => nav('/admin/veiculos')}>Cancelar</button>
          <button className="btn btn--primary" disabled={busy || uploading > 0}>{busy ? 'Salvando…' : existing ? 'Salvar alterações' : 'Publicar no site'}</button>
        </div>
      </form>
    </div>
  )
}
