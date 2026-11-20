import { Form } from '@adonisjs/inertia/react'
import { IconLogout } from '@tabler/icons-react'
import { cn } from 'cn'
import CsrfField from '~/components/atoms/csrf_field'
import { buttonVariants } from '~/components/ui/button'

// "Keluar" for every role, in the same two places: the Profil page and the desktop side nav (D107).
// `className` lets a side nav style it like its other entries; `labelClassName` hides the word in a compact nav.
export default function LogoutButton({
  className,
  labelClassName,
}: {
  className?: string
  labelClassName?: string
}) {
  return (
    <Form route="session.destroy">
      <CsrfField />
      <button
        type="submit"
        className={
          className ??
          cn(buttonVariants({ variant: 'outline', className: 'h-11 w-full gap-2 sm:w-auto' }))
        }
      >
        <IconLogout aria-hidden="true" className="size-5 shrink-0" />
        <span className={labelClassName}>Keluar</span>
      </button>
    </Form>
  )
}
