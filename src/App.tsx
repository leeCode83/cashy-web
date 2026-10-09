/**
 * Route table (brief §3) — every cash-out step has its own URL so Back is
 * always meaningful. Routes render inside the AppShell frame.
 */
import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './components/layout/AppShell.tsx'
import Landing from './pages/Landing.tsx'
import Dashboard from './pages/creator/Dashboard.tsx'
import History from './pages/creator/History.tsx'
import CashOutLayout from './pages/creator/cashout/CashOutLayout.tsx'
import Verify from './pages/creator/cashout/Verify.tsx'
import Amount from './pages/creator/cashout/Amount.tsx'
import Review from './pages/creator/cashout/Review.tsx'
import Done from './pages/creator/cashout/Done.tsx'
import Vault from './pages/lp/Vault.tsx'
import Position from './pages/lp/Position.tsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Landing />} />
        <Route path="/creator" element={<Dashboard />} />
        <Route path="/creator/cash-out" element={<CashOutLayout />}>
          <Route index element={<Navigate to="verify" replace />} />
          <Route path="verify" element={<Verify />} />
          <Route path="amount" element={<Amount />} />
          <Route path="review" element={<Review />} />
          <Route path="done" element={<Done />} />
        </Route>
        <Route path="/creator/history" element={<History />} />
        <Route path="/lp" element={<Vault />} />
        <Route path="/lp/position" element={<Position />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
