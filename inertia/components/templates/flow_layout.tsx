import { type ReactNode } from 'react'
import FlashToasts from '~/components/organisms/flash_toasts'

export default function FlowLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <FlashToasts />
    </>
  )
}
