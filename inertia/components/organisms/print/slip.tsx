import type { ReactNode } from 'react'
import type { Store } from '~/lib/print/sheet'

export function SlipStore({ store }: { store: Store }) {
  return (
    <header className="flex flex-col items-center gap-0.5 text-center">
      <p className="text-[14px] font-bold">{store.name}</p>
      <p>{store.address}</p>
      <p>WA {store.whatsapp}</p>
      <p>{store.hours}</p>
    </header>
  )
}

export function SlipDivider() {
  return <hr className="my-1.5 border-0 border-t border-dashed border-black" />
}

export function SlipRow({
  label,
  children,
  isStrong = false,
}: {
  label: ReactNode
  children: ReactNode
  isStrong?: boolean
}) {
  return (
    <div
      className={isStrong ? 'flex justify-between gap-2 font-bold' : 'flex justify-between gap-2'}
    >
      <span>{label}</span>
      <span className="text-right tabular-nums">{children}</span>
    </div>
  )
}

export function SlipStamp({ children }: { children: ReactNode }) {
  return (
    <p className="my-1 border-2 border-black py-1 text-center text-[16px] font-bold tracking-[0.12em]">
      {children}
    </p>
  )
}
