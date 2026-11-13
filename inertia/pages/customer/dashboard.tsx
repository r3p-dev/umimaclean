import { LayoutGrid } from 'lucide-react'
import Page from '~/components/organisms/page'
import AppLayout from '~/components/templates/app_layout'

export default function Dashboard() {
  return (
    <Page title="Dashboard" isTitleHidden>
      <div className="empty">
        <div className="empty__mark">
          <LayoutGrid size={22} />
        </div>
        <h1>Your dashboard is ready</h1>
        <p>
          It&apos;s empty on purpose. A clean starting point with nothing to undo. Add your first
          route and component to begin.
        </p>
        <p className="mono" style={{ fontSize: 12.5, color: 'var(--subtle)', marginTop: 4 }}>
          Start in <span className="kbd">inertia/pages/customer/dashboard.tsx</span>
        </p>
      </div>
    </Page>
  )
}

Dashboard.layout = [AppLayout]
