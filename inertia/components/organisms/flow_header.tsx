import { Link } from '@adonisjs/inertia/react'
import Logo from '~/components/atoms/logo'

export default function FlowHeader({ title }: { title: string }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-1 px-5">
        <span className="mr-1.5 hidden items-center border-r border-border pr-3.5 sm:flex">
          <Link route="home" className="rounded-sm">
            <Logo />
          </Link>
        </span>
        <p className="flex-1 text-base leading-none font-semibold">{title}</p>
      </div>
    </header>
  )
}
