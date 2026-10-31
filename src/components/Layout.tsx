import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSite } from '../lib/SiteContext'
import { waLink, WA_GENERAL } from '../lib/whatsapp'
import { track } from '../lib/store'
import { pageview } from '../lib/analytics'
import { Logo } from './Logo'
import { WhatsAppIcon, InstagramIcon, FacebookIcon, MenuIcon, CloseIcon, PinIcon } from './Icons'

export function Layout() {
  const { settings } = useSite()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
    pageview(pathname)
  }, [pathname])

  const wa = waLink(settings, WA_GENERAL)

  return (
    <>
      <a href="#conteudo" className="skip">Pular para o conteúdo</a>
      {settings.announcement && <div className="announce">{settings.announcement}</div>}
      <header className="header">
        <div className="wrap header__row">
          <Logo />
          <nav className={`nav ${open ? 'nav--open' : ''}`} aria-label="Principal">
            <NavLink to="/estoque">Estoque</NavLink>
            <a href="/#como-comprar">Como comprar</a>
            <a href="/#loja">Onde estamos</a>
            <a className="btn btn--wa nav__wa" href={wa} target="_blank" rel="noopener" onClick={() => track('whatsapp')}>
              <WhatsAppIcon size={18} /> Chamar no WhatsApp
            </a>
          </nav>
          <button className="menu-btn" aria-expanded={open} aria-label={open ? 'Fechar menu' : 'Abrir menu'} onClick={() => setOpen((o) => !o)}>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      <main id="conteudo">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="wrap footer__grid">
          <div>
            <Logo />
            <p className="footer__text">{settings.tagline}. Compra, venda, troca e financiamento.</p>
          </div>
          <div>
            <h2 className="footer__h">Visite a loja</h2>
            <p className="footer__text">
              <PinIcon size={16} /> {settings.address} – {settings.neighborhood}
              <br />
              {settings.city}
            </p>
            {settings.hours.map((h) => (
              <p className="footer__text" key={h}>{h}</p>
            ))}
          </div>
          <div>
            <h2 className="footer__h">Fale com a gente</h2>
            <a className="footer__link" href={wa} target="_blank" rel="noopener" onClick={() => track('whatsapp')}>
              <WhatsAppIcon size={16} /> {settings.whatsapp}
            </a>
            {settings.phone && (
              <a className="footer__link footer__phone" href={`tel:+55${settings.phone.replace(/\D/g, '')}`}>
                {settings.phone}
              </a>
            )}
            <div className="footer__social">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener" aria-label="Instagram">
                  <InstagramIcon />
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener" aria-label="Facebook">
                  <FacebookIcon />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="wrap footer__base">
          <span>© {new Date().getFullYear()} {settings.store_name}</span>
          <span>Fotos de demonstração: Wikimedia Commons</span>
        </div>
      </footer>

      <a className="wa-fab" href={wa} target="_blank" rel="noopener" aria-label="Conversar no WhatsApp" onClick={() => track('whatsapp')}>
        <WhatsAppIcon size={30} />
      </a>
    </>
  )
}
