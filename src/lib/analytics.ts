// Carrega o Google Analytics 4 só quando o ID for configurado no painel.
let loaded = false
export function loadGA(id: string) {
  if (loaded || !/^G-[A-Z0-9]+$/i.test(id)) return
  loaded = true
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
  document.head.appendChild(s)
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void }
  w.dataLayer = w.dataLayer || []
  w.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments)
  }
  w.gtag('js', new Date())
  w.gtag('config', id)
}

export function pageview(path: string) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void }
  w.gtag?.('event', 'page_view', { page_path: path })
}
