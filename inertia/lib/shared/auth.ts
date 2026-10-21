import { router, usePage } from '@inertiajs/react'
import { urlFor } from '~/client'

export function signOut() {
  router.post(urlFor('auth.logout'))
}

export function useAccount() {
  const account = usePage().props.account
  return account ?? { name: '', firstName: '', role: 'staff' as const, roleLabel: '' }
}
