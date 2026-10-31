import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Category, Vehicle } from '../lib/types'
import { VehicleImage } from './VehicleImage'

const INTERVAL = 6000 // tempo parado em cada grupo, para dar tempo de ler

function perViewFor(width: number) {
  if (width >= 900) return 3
  if (width >= 600) return 2
  return 1
}

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      {dir === 'left' ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  )
}

/**
 * Categorias em grupos (3 no computador, 2 no tablet, 1 no celular).
 * Avança um grupo por vez e PARA em cada um. Pausa com o mouse em cima,
 * com foco do teclado, fora da tela ou com a aba escondida. Depois que a
 * pessoa usa setas, pontos ou arrasta, a troca automática desliga de vez:
 * quem está procurando não pode ter a tela mudando sozinha.
 */
export function CategoryCarousel({ items }: { items: { c: Category; list: Vehicle[] }[] }) {
  const track = useRef<HTMLUListElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const [perView, setPerView] = useState(() => perViewFor(typeof window === 'undefined' ? 1200 : window.innerWidth))
  const [page, setPage] = useState(0)
  const [hover, setHover] = useState(false)
  const [visible, setVisible] = useState(false)
  const [userStopped, setUserStopped] = useState(false)
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const pages = Math.max(1, Math.ceil(items.length / perView))
  const auto = !reduced && !userStopped && pages > 1
  const running = auto && !hover && visible

  // quantos por vez, conforme a largura
  useEffect(() => {
    const on = () => setPerView(perViewFor(window.innerWidth))
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])

  // só roda quando a seção está na tela e a aba está aberta
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting && !document.hidden), { threshold: 0.4 })
    io.observe(el)
    const onVis = () => document.hidden && setVisible(false)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const goTo = useCallback(
    (p: number) => {
      const el = track.current
      if (!el) return
      const target = ((p % pages) + pages) % pages
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0
      el.scrollTo({ left: target * (el.clientWidth + gap), behavior: reduced ? 'auto' : 'smooth' })
      setPage(target)
    },
    [pages, reduced],
  )

  // página atual a partir da rolagem (cobre o arrastar no celular)
  useEffect(() => {
    const el = track.current
    if (!el) return
    let t = 0
    const on = () => {
      cancelAnimationFrame(t)
      t = requestAnimationFrame(() => {
        const gap = parseFloat(getComputedStyle(el).columnGap) || 0
        const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4
        setPage(atEnd ? pages - 1 : Math.round(el.scrollLeft / (el.clientWidth + gap)))
      })
    }
    el.addEventListener('scroll', on, { passive: true })
    return () => el.removeEventListener('scroll', on)
  }, [pages])

  // troca automática: um grupo, depois para INTERVAL ms
  useEffect(() => {
    if (!running) return
    const id = window.setTimeout(() => goTo(page + 1), INTERVAL)
    return () => window.clearTimeout(id)
  }, [running, page, goTo])

  const stop = () => setUserStopped(true)

  return (
    <div
      ref={root}
      className={`carousel ${running ? 'carousel--running' : ''}`}
      style={{ ['--per' as string]: perView, ['--interval' as string]: `${INTERVAL}ms` }}
      role="region"
      aria-roledescription="carrossel"
      aria-label="Categorias"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={() => setHover(false)}
    >
      <ul className="cats" ref={track} onPointerDown={stop} onWheel={(e) => Math.abs(e.deltaX) > Math.abs(e.deltaY) && stop()} aria-live={auto ? 'off' : 'polite'}>
        {items.map(({ c, list }, i) => (
          <li key={c.id} aria-roledescription="slide" aria-label={`${i + 1} de ${items.length}: ${c.name}`}>
            <Link to={`/estoque?categoria=${c.id}`} className="cat">
              <div className="cat__img">
                <VehicleImage src={list.find((v) => v.images[0])?.images[0]} alt="" />
              </div>
              <div className="cat__row">
                <span className="cat__name">{c.name}</span>
                <span className="cat__count">
                  {list.length} {list.length === 1 ? 'disponível' : 'disponíveis'}
                </span>
              </div>
              {c.short && <span className="cat__short">{c.short}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <div className="carousel__controls">
          <div className="carousel__dots" role="group" aria-label="Escolher grupo de categorias">
            {Array.from({ length: pages }, (_, p) => (
              <button
                key={`${p}-${p === page ? 'on' : 'off'}`}
                className={`carousel__dot ${p === page ? 'carousel__dot--on' : ''}`}
                aria-label={`Grupo ${p + 1} de ${pages}`}
                aria-current={p === page ? 'true' : undefined}
                onClick={() => {
                  stop()
                  goTo(p)
                }}
              >
                <span className="carousel__fill" />
              </button>
            ))}
          </div>
          <div className="carousel__arrows">
            {auto && (
              <button className="carousel__pause" onClick={stop} aria-label="Parar a troca automática">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" />
                  <rect x="14" y="5" width="4" height="14" />
                </svg>
              </button>
            )}
            <button
              onClick={() => {
                stop()
                goTo(page - 1)
              }}
              aria-label="Categorias anteriores"
            >
              <Arrow dir="left" />
            </button>
            <button
              onClick={() => {
                stop()
                goTo(page + 1)
              }}
              aria-label="Próximas categorias"
            >
              <Arrow dir="right" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
