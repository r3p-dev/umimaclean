import { urlFor } from '~/client'
import { IconArrowRight } from '@tabler/icons-react'
import { LinkButton } from '~/components/ui/button'

export default function OrderPickupButton({
  label = 'Pesan Penjemputan',
  withIcon = true,
  className,
}: {
  label?: string
  withIcon?: boolean
  className?: string
}) {
  return (
    <LinkButton size="cta" className={className} href={urlFor('order.details')}>
      {label}
      {withIcon && <IconArrowRight />}
    </LinkButton>
  )
}
