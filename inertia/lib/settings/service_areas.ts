import { router } from '@inertiajs/react'
import { urlFor } from '~/client'

export function searchServiceAreas(query: string) {
  router.get(urlFor('admin.areas'), query ? { q: query } : {}, {
    preserveState: true,
    preserveScroll: true,
    replace: true,
    only: ['q', 'results'],
  })
}

export function setServiceAreaActive(id: number, isActive: boolean) {
  router.put(
    urlFor('admin.areas.update', { id }),
    { isActive },
    { preserveState: true, preserveScroll: true }
  )
}
