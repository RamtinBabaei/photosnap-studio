import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowLink } from './ArrowLink';

const nav = [
  { to: '/stories', label: 'Stories' },
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
];

function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const background = document.querySelectorAll<HTMLElement>('#main, .site-footer');
    background.forEach((element) => {
      element.inert = true;
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
      if (event.key === 'Tab') {
        const links = menu.current?.querySelectorAll<HTMLAnchorElement>('a');
        const last = links?.[links.length - 1];
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          toggle.current?.focus();
        }
        if (event.shiftKey && document.activeElement === toggle.current) {
          event.preventDefault();
          last?.focus();
        }
      }
    };
    const media = window.matchMedia('(min-width: 768px)');
    const onResize = () => {
      if (media.matches) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    media.addEventListener('change', onResize);
    return () => {
      document.body.style.overflow = previous;
      background.forEach((element) => {
        element.inert = false;
      });
      document.removeEventListener('keydown', onKey);
      media.removeEventListener('change', onResize);
    };
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="page-container header-inner">
          <Link to="/" aria-label="Photosnap home" onClick={() => setOpen(false)}>
            <img className="brand" src="/assets/logo.svg" alt="Photosnap" width="170" height="16" />
          </Link>
          <button
            ref={toggle}
            className={`menu-toggle ${open ? 'is-open' : ''}`}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            aria-controls="main-navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span />
            <span />
          </button>
          <nav
            ref={menu}
            id="main-navigation"
            aria-label="Main navigation"
            className={`main-nav ${open ? 'is-open' : ''}`}
          >
            <div className="nav-links">
              {nav.map((item) => (
                <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
            </div>
            <Link className="button nav-invite" to="/invite" onClick={() => setOpen(false)}>
              Get an invite
            </Link>
          </nav>
        </div>
      </header>
      {open && (
        <button
          className="menu-backdrop"
          aria-label="Close navigation overlay"
          tabIndex={-1}
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="page-container footer-grid">
        <Link to="/" className="footer-brand" aria-label="Photosnap home">
          <img src="/assets/logo-white.svg" alt="Photosnap" width="170" height="16" />
        </Link>
        <nav aria-label="Footer navigation" className="footer-nav">
          <Link to="/">Home</Link>
          {nav.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="footer-invite">
          <ArrowLink to="/invite">Get an invite</ArrowLink>
        </div>
        <div className="social-links" aria-label="Follow Photosnap">
          {[
            ['facebook', 'https://www.facebook.com/'],
            ['youtube', 'https://www.youtube.com/'],
            ['twitter', 'https://x.com/'],
            ['pinterest', 'https://www.pinterest.com/'],
            ['instagram', 'https://www.instagram.com/'],
          ].map(([name, url]) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${name}`}
            >
              <img src={`/assets/${name}.svg`} alt="" width="20" height="20" loading="lazy" />
            </a>
          ))}
        </div>
        <div className="footer-legal">
          <span>Copyright {new Date().getFullYear()}. All Rights Reserved</span>
          <Link to="/privacy">Privacy & demo information</Link>
        </div>
      </div>
    </footer>
  );
}

export function Layout() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    window.scrollTo({ top: 0, behavior: 'instant' });
    main.current?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <>
      <Header />
      <main id="main" ref={main} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
