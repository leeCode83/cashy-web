/**
 * Cash-out shell — stepper header plus the routed step. The stepper is the
 * one place that always says where you are in the flow (brief §6.3).
 */
import { Outlet } from 'react-router'

export default function CashOutLayout() {
  return (
    <div className="container page">
      <Outlet />
    </div>
  )
}
