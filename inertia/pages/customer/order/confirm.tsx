import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { urlFor } from '~/client'
import BackLink from '~/components/molecules/back_link'
import StepProgress from '~/components/molecules/step_progress'
import FlowFooter from '~/components/organisms/flow_footer'
import FlowHeader from '~/components/organisms/flow_header'
import OrderReview from '~/components/organisms/order/order_review'
import OtpDialog from '~/components/organisms/verification/otp_dialog'
import FlowLayout from '~/components/templates/flow_layout'
import { Button, LinkButton } from '~/components/ui/button'
import { clearDraft, useOrderStep } from '~/lib/order/draft'
import { placeOrder } from '~/lib/tracking/orders'
import { verifiedPhone } from '~/lib/verification/session'

export default function OrderConfirm() {
  const { draft, blocked } = useOrderStep(2)
  const [verifying, setVerifying] = useState(false)

  if (blocked || !draft.point || !draft.date || draft.slot === null) return null

  function createOrder() {
    placeOrder(draft)
    clearDraft()
    router.visit(urlFor('order.created'), { replace: true })
  }

  function submit() {
    if (verifiedPhone() === draft.phone) createOrder()
    else setVerifying(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Head title="Konfirmasi Pesanan" />
      <FlowHeader title="Konfirmasi Pesanan" step={3} className="bg-card" />
      <div className="mx-auto box-content max-w-page px-5">
        <StepProgress current={2} className="pt-3.5" />
        <h1 className="sr-only">Periksa pesanan Anda</h1>
        <OrderReview
          draft={draft}
          point={draft.point}
          date={draft.date}
          slot={draft.slot}
          className="pt-4"
        />
      </div>
      <FlowFooter className="mt-4">
        <BackLink variant="footer" href={urlFor('order.items')} />
        <Button
          size="cta"
          onPress={submit}
          className="flex-1 sm:w-auto sm:min-w-74 sm:flex-none sm:px-7"
        >
          Konfirmasi Pesanan
        </Button>
      </FlowFooter>
      <OtpDialog
        open={verifying}
        onOpenChange={setVerifying}
        phone={draft.phone}
        submitLabel="Verifikasi & Buat Pesanan"
        onVerified={createOrder}
        changeNumber={
          <LinkButton variant="link" href={urlFor('order.details')}>
            Ganti nomor
          </LinkButton>
        }
      />
    </div>
  )
}

OrderConfirm.layout = [FlowLayout]
