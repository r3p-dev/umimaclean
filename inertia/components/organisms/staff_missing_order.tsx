import { IconSearchOff } from '@tabler/icons-react'
import { LinkButton } from '~/components/ui/button'
import EmptyState from '~/components/molecules/empty_state'

export default function StaffMissingOrder({
  number,
  backHref,
  backLabel,
}: {
  number: string
  backHref: string
  backLabel: string
}) {
  return (
    <div className="mx-auto w-full max-w-160 p-4">
      <div className="rounded-lg border border-border bg-card p-5">
        <EmptyState
          icon={IconSearchOff}
          title={`Pesanan ${number} tidak ada di antrean ini`}
          description="Pesanan mungkin sudah selesai diproses atau nomornya salah."
          action={
            <LinkButton variant="outline" size="desktop" href={backHref}>
              {backLabel}
            </LinkButton>
          }
        />
      </div>
    </div>
  )
}
