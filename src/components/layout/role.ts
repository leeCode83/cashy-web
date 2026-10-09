/**
 * Role resolution — one app, two doors (brief §3): the route prefix decides
 * which nav and screens apply. There is no role toggle in the nav; switching
 * happens through the account menu.
 */
import { useLocation } from 'react-router'

/** The two personas the demo serves. */
export type Role = 'creator' | 'lp'

/** Current role from the URL. `/lp/*` is the LP door, everything else creator. */
export function useRole(): Role {
  const { pathname } = useLocation()
  return pathname.startsWith('/lp') ? 'lp' : 'creator'
}
