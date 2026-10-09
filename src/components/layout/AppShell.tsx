/**
 * App shell — skip link, top bar, routed content, mobile tab bar, toast
 * host. Every route renders inside this frame.
 */
import { Outlet } from 'react-router'
import { ToastProvider } from '../status/Toast.tsx'
import { TopBar } from './TopBar.tsx'
import { BottomTabs } from './BottomTabs.tsx'

/** The frame around every screen. */
export function AppShell() {
  return (
    <ToastProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <TopBar />
      <main id="main" className="main">
        <Outlet />
      </main>
      <BottomTabs />
    </ToastProvider>
  )
}
