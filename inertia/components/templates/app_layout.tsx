import type { ReactNode } from 'react'
import Logo from '~/components/atoms/logo'
import { House, LogOut } from 'lucide-react'
import { Form } from '@adonisjs/inertia/react'
import ThemeToggle from '~/components/atoms/theme_toggle'
import FlashToasts from '~/components/molecules/flash_toasts'
import NavigationLink, { type NavigationItem } from '~/components/atoms/navigation_link'

const navigationItems: NavigationItem[] = [{ label: 'Dashboard', route: 'dashboard', icon: House }]

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="header header--bar">
        <div className="header__inner">
          <Logo size={28} />
          <div className="header__right">
            <ThemeToggle />
            <Form route="session.destroy">
              <button type="submit" className="btn btn--secondary btn--sm">
                <LogOut size={15} /> Log out
              </button>
            </Form>
          </div>
        </div>
      </header>

      <nav className="subnav">
        <div className="subnav__inner">
          {navigationItems.map(({ label, route, icon: Icon }) => (
            <NavigationLink key={label} route={route} className="subnav__item">
              {Icon && <Icon size={14} />}
              {label}
            </NavigationLink>
          ))}
        </div>
      </nav>

      <div className="app-main">{children}</div>
      <FlashToasts />
    </>
  )
}
