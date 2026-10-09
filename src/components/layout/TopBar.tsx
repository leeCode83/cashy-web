/**
 * Top bar — one mode at a time (brief §3): creator links or LP links, plus
 * the account menu on the right for switching roles. On the public landing
 * it renders the marketing nav (logo + pill links + CTA). Hidden below
 * 640 px, where the bottom tab bar takes over.
 */
import { Link, NavLink, useLocation } from 'react-router'
import { CaretDown, Wallet } from '@phosphor-icons/react'
import { Logo } from './Logo.tsx'
import { useRole } from './role.ts'

/** Nav entries per role — tab/link labels are Title Case (brief §7.3). */
const NAV = {
  creator: [
    { to: '/creator', label: 'Dashboard' },
    { to: '/creator/cash-out/verify', label: 'Cash Out' },
    { to: '/creator/history', label: 'History' },
  ],
  lp: [
    { to: '/lp', label: 'Vault' },
    { to: '/lp/position', label: 'My Position' },
  ],
} as const

/** Desktop top bar. On `/` it renders the public landing variant. */
export function TopBar() {
  const { pathname } = useLocation()
  const role = useRole()

  if (pathname === '/') {
    return (
      <header className="topbar">
        <div className="container topbar__inner">
          <Link to="/" className="topbar__brand" translate="no">
            <Logo />
            <span>Cashy</span>
          </Link>
          <nav className="topbar__nav topbar__pill" aria-label="Main">
            <a className="topbar__link" href="#how">
              How It Works
            </a>
            <a className="topbar__link" href="#rail">
              The Rail
            </a>
            <NavLink className="topbar__link" to="/lp">
              Vault
            </NavLink>
          </nav>
          <Link className="btn btn--primary" to="/creator">
            Get Cash Early
          </Link>
        </div>
      </header>
    )
  }

  return (
    <header className="topbar">
      <div className="container topbar__inner">
        <Link to="/" className="topbar__brand" translate="no">
          <Logo />
          <span>Cashy</span>
        </Link>
        <nav className="topbar__nav" aria-label="Main">
          {NAV[role].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `topbar__link${isActive ? ' topbar__link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <details className="popover account">
          <summary className="popover__summary account__summary" aria-label="Account menu">
            <Wallet size={18} aria-hidden />
            <span>Account</span>
            <CaretDown size={14} aria-hidden />
          </summary>
          <div className="popover__panel account__panel">
            {role === 'creator' ? (
              <Link className="account__item" to="/lp">
                Switch to LP Vault
              </Link>
            ) : (
              <Link className="account__item" to="/creator">
                Switch to Creator
              </Link>
            )}
          </div>
        </details>
      </div>
    </header>
  )
}
