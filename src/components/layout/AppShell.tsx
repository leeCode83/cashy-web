/**
 * App shell — skip link, top bar, routed content, mobile tab bar, toast
 * host. Every route renders inside this frame.
 */
import { Outlet, useLocation } from 'react-router'
import { ToastProvider } from '../status/Toast.tsx'
import { TopBar } from './TopBar.tsx'
import { BottomTabs } from './BottomTabs.tsx'

/** The frame around every screen. The mobile tab bar stays off the landing. */
export function AppShell() {
  const { pathname } = useLocation()
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
