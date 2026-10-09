/**
 * History (brief §6.6) — the full activity list. Table on desktop, card list
 * on mobile, rows expand for detail. Empty state invites the first cash-out.
 */
import { ActivityList } from '../../components/ActivityList.tsx'
import { useAppState } from '../../state/AppStateContext.ts'

export default function History() {
  const { history } = useAppState()
  return (
    <div className="container page">
      <header>
        <h1 className="page__title">History</h1>
      </header>
      <ActivityList entries={history} />
    </div>
  )
}
