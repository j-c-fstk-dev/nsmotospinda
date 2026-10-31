import { useEffect, useState } from 'react'
import { useSite } from '../../lib/SiteContext'
import { saveSettings } from '../../lib/store'
import { DEFAULT_CATEGORIES } from '../../lib/categories'
import { slugify } from '../../lib/format'
import type { Category, VehicleType } from '../../lib/types'
import { ArrowUpDown, EyeIcon } from '../../components/Icons'

export default function AdminCategories() {
  const { settings, vehicles, reload } = useSite()
  const [list, setList] = useState<Category[]>(settings.categories)
  const [open, setOpen] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [dirty, setDirty] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<VehicleType>('moto')

  useEffect(() => setList(settings.categories), [settings.categories])

  const count = (id: string) => vehicles.filter((v) => v.category === id).length
  const update = (next: Category[]) => {
    setList(next)
    setDirty(true)
    setMsg('')
  }
  const patch = (id: string, p: Partial<Category>) => update(list.map((c) => (c.id === id ? { ...c, ...p } : c)))
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= list.length) return
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    update(next)
  }

  function add() {
    const name = newName.trim()
    if (!name) return
    let id = slugify(name) || 'categoria'
    while (list.some((c) => c.id === id)) id += '-2'
    update([...list, { id, name, short: '', description: '', type: newType, visible: true }])
    setNewName('')
    setOpen(id)
  }

  async function save() {
    await saveSettings({ ...settings, categories: list })
    await reload()
    setDirty(false)
    setMsg('Categorias salvas.')
  }

  const groups: [VehicleType, string][] = [
    ['moto', 'Motos'],
    ['carro', 'Carros'],
  ]

  return (
    <div className="admin__page">
      <header className="admin__head">
        <h1>Categorias</h1>
        <button className="btn btn--primary" onClick={save} disabled={!dirty}>
          {dirty ? 'Salvar alterações' : 'Tudo salvo'}
        </button>
      </header>
      <p className="muted" style={{ marginTop: -8 }}>
        A ordem aqui é a ordem do site. Categoria escondida some do menu e os veículos dela saem do site, sem serem apagados. Categoria sem veículo não aparece para o público.
      </p>
      {msg && <p className="toast" role="status">{msg}</p>}

      {groups.map(([type, label]) => (
        <section key={type}>
          <h2 className="admin__h2">{label}</h2>
          <ul className="alist">
            {list.map((c, i) =>
              c.type !== type ? null : (
                <li key={c.id} className={`crow ${c.visible ? '' : 'crow--off'}`}>
                  <div className="crow__line">
                    <div className="crow__order">
                      <button className="icon-btn" onClick={() => move(i, -1)} aria-label={`Subir ${c.name}`}>
                        <ArrowUpDown dir="up" />
                      </button>
                      <button className="icon-btn" onClick={() => move(i, 1)} aria-label={`Descer ${c.name}`}>
                        <ArrowUpDown dir="down" />
                      </button>
                    </div>
                    <button className="crow__name" onClick={() => setOpen(open === c.id ? null : c.id)} aria-expanded={open === c.id}>
                      <strong>{c.name}</strong>
                      <span>
                        {c.short || 'Sem subtítulo'}, {count(c.id)} {count(c.id) === 1 ? 'veículo' : 'veículos'}
                      </span>
                    </button>
                    <button
                      className={`icon-btn ${c.visible ? 'icon-btn--on-ink' : ''}`}
                      aria-pressed={c.visible}
                      title={c.visible ? 'Esconder do site' : 'Mostrar no site'}
                      onClick={() => patch(c.id, { visible: !c.visible })}
                    >
                      <EyeIcon off={!c.visible} />
                      <span className="sr-only">{c.visible ? 'Esconder do site' : 'Mostrar no site'}</span>
                    </button>
                  </div>
                  {open === c.id && (
                    <div className="crow__edit">
                      <label className="field">
                        <span>Nome</span>
                        <input value={c.name} onChange={(e) => patch(c.id, { name: e.target.value })} />
                      </label>
                      <label className="field">
                        <span>Subtítulo curto</span>
                        <input value={c.short} maxLength={28} placeholder="Ex.: Dia a dia" onChange={(e) => patch(c.id, { short: e.target.value })} />
                      </label>
                      <label className="field crow__wide">
                        <span>Descrição (aparece no topo da página da categoria)</span>
                        <textarea rows={2} value={c.description} onChange={(e) => patch(c.id, { description: e.target.value })} />
                      </label>
                      <button
                        className="btn btn--danger btn--sm"
                        disabled={count(c.id) > 0}
                        title={count(c.id) > 0 ? 'Mova ou exclua os veículos desta categoria antes' : ''}
                        onClick={() => confirm(`Excluir a categoria ${c.name}?`) && update(list.filter((x) => x.id !== c.id))}
                      >
                        Excluir categoria
                      </button>
                      {count(c.id) > 0 && <small className="muted">Para excluir, mova os {count(c.id)} veículos para outra categoria. Ou só esconda.</small>}
                    </div>
                  )}
                </li>
              ),
            )}
          </ul>
        </section>
      ))}

      <h2 className="admin__h2">Nova categoria</h2>
      <div className="row" style={{ maxWidth: 560 }}>
        <input value={newName} placeholder="Ex.: Elétricas, Off-road, Quadriciclo" onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} aria-label="Nome da nova categoria" />
        <select value={newType} onChange={(e) => setNewType(e.target.value as VehicleType)} aria-label="Tipo" className="row__select">
          <option value="moto">Moto</option>
          <option value="carro">Carro</option>
        </select>
        <button className="btn btn--ink btn--sm" style={{ minHeight: 46 }} onClick={add}>
          Adicionar
        </button>
      </div>
      <p style={{ marginTop: 32 }}>
        <button className="link" onClick={() => confirm('Voltar às categorias padrão? Nomes e textos editados serão perdidos.') && update(DEFAULT_CATEGORIES)}>
          Restaurar categorias padrão
        </button>
      </p>
    </div>
  )
}
