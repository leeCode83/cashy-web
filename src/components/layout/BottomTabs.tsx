/**
 * Bottom tab bar for mobile (<640 px) — text label under each icon, one tab
 * per primary destination (brief §3). Tabs navigate only; they never trigger
 * actions. Respects the safe area inset.
 */
import { NavLink } from 'react-router'
import { ChartLine, ClockCounterClockwise, Coins, Vault as VaultIcon } from '@phosphor-icons/react'
import { useRole } from './role.ts'

/** Tab entries per role; 3 for creators, 2 for LPs. */
const TABS = {
  creator: [
    { to: '/creator', label: 'Dashboard', Icon: ChartLine },
    { to: '/creator/cash-out/verify', label: 'Cash Out', Icon: Coins },
    { to: '/creator/history', label: 'History', Icon: ClockCounterClockwise },
  ],
  lp: [
    { to: '/lp', label: 'Vault', Icon: VaultIcon },
    { to: '/lp/position', label: 'Position', Icon: ChartLine },
  ],
} as const

/** Mobile-only bottom navigation. */
export function BottomTabs() {
  const role = useRole()
  return (
    <nav className="tabs" aria-label="Main">
      {TABS[role].map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `tabs__item${isActive ? ' tabs__item--active' : ''}`}
        >
          <Icon size={22} aria-hidden />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
