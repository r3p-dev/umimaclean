import { Head } from '@inertiajs/react'
import { IconPrinter } from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import Logo from '~/components/atoms/logo'
import BackLink from '~/components/molecules/back_link'
import AccountLayout from '~/components/templates/account_layout'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { formatRupiah } from '~/lib/shared/format'

type Store = { name: string; whatsapp: string; address: string; hours: string }

export default function OrderReceipt({ receipt, store }: { receipt: Data.Receipt; store: Store }) {
  const payment = receipt.payment

  return (
    <>
      <Head title={`Struk ${receipt.number}`} />
      <div className="mx-auto box-content max-w-page px-5 pt-4 pb-10 lg:pt-8">
        <div className="print:hidden">
          <BackLink
            href={urlFor('customer.orders.show', { id: receipt.id })}
            label="Detail pesanan"
          />
        </div>
        <div className="mx-auto mt-3 max-w-120">
          <Card role="article" aria-labelledby="receipt-title">
            <CardHeader className="border-b border-dashed border-border-strong">
              <Logo size="md" className="w-full" />
              <CardDescription className="text-foreground-secondary">
                {store.address} · {store.hours}
              </CardDescription>
              <CardTitle as="h1" id="receipt-title" className="text-h2">
                Struk <span className="font-mono">{receipt.number}</span>
              </CardTitle>
              <CardDescription className="text-sm text-foreground-secondary">
                {receipt.customer} · dibuat {receipt.createdAt}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {receipt.items.map((item, index) => (
                  <li key={`${item.name}-${index}`} className="flex flex-col gap-1">
                    <span className="flex justify-between gap-3 text-md font-semibold">
                      <span>{item.name}</span>
                      <span className="tabular-nums">{formatRupiah(item.subtotal)}</span>
                    </span>
                    {item.services.map((service) => (
                      <span
                        key={service.name}
                        className="flex justify-between gap-3 text-sm text-foreground-secondary"
                      >
                        <span>{service.name}</span>
                        <span className="tabular-nums">{formatRupiah(service.price)}</span>
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
              <dl className="flex flex-col gap-2 border-t border-dashed border-border-strong pt-4 text-sm">
                <div className="flex justify-between text-lg font-bold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatRupiah(receipt.total)}</dd>
                </div>
                {payment && (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Dibayar</dt>
                      <dd>
                        {payment.method} · {payment.paidAt}
                      </dd>
                    </div>
                    {payment.cashReceived !== null && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Uang diterima</dt>
                        <dd className="tabular-nums">{formatRupiah(payment.cashReceived)}</dd>
                      </div>
                    )}
                    {payment.change !== null && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Kembalian</dt>
                        <dd className="tabular-nums">{formatRupiah(payment.change)}</dd>
                      </div>
                    )}
                    {payment.reference && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">Referensi</dt>
                        <dd className="font-mono text-meta">{payment.reference}</dd>
                      </div>
                    )}
                  </>
                )}
              </dl>
              <p className="text-center text-meta text-muted-foreground">
                Terima kasih sudah memakai {store.name}.
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="desktop"
                className="w-full gap-2 print:hidden"
                onPress={() => window.print()}
              >
                <IconPrinter className="size-5" />
                Cetak / Simpan PDF
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}

OrderReceipt.layout = [AccountLayout]
