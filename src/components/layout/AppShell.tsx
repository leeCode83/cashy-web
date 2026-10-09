/**
 * App shell — skip link, top bar, routed content, mobile tab bar, toast
 * host. Every route renders inside this frame. The landing routes dark,
 * the app routes stay light: `data-theme` drives the token swap.
 */
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { ToastProvider } from '../status/Toast.tsx'
import { TopBar } from './TopBar.tsx'
import { BottomTabs } from './BottomTabs.tsx'

/** Browser UI chrome color per theme — kept in sync with tokens.css. */
const CHROME = { dark: '#0b0f0c', light: '#ffffff' } as const

/** The frame around every screen. The mobile tab bar stays off the landing. */
export function AppShell() {
  const { pathname } = useLocation()
  const dark = pathname === '/'

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? CHROME.dark : CHROME.light)
  }, [dark])

  return (
    <ToastProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <TopBar />
      <main id="main" className="main">
        <Outlet />
      </main>
      {pathname !== '/' && <BottomTabs />}
    </ToastProvider>
  )
}
