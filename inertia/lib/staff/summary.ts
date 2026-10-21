import { usePage } from '@inertiajs/react'

export type StaffCounts = { jemput: number; proses: number; antar: number }

export function useStaffCounts(): StaffCounts {
  return usePage().props.staffCounts ?? { jemput: 0, proses: 0, antar: 0 }
}
