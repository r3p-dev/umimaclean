import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconArchive,
  IconCheck,
  IconChevronRight,
  IconTag,
  IconTruckDelivery,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import EmptyState from '~/components/molecules/empty_state'
import AccountLayout from '~/components/templates/account_layout'
import { LinkButton } from '~/components/ui/button'
import type { Data } from '@generated/data'
import type { SavedAddress } from '~/lib/order/addresses'
import { cn } from '~/lib/shared/utils'

export default function CustomerWelcome({
  user,
  primaryAddress,
}: {
  user: Data.User
  primaryAddress: SavedAddress | null
}) {
  const steps = [
    {
      title: 'Simpan alamat jemput',
      text: 'Isi sekali, dipakai otomatis setiap pesan.',
      done: !!primaryAddress,
      action: { label: 'Tambah alamat', href: urlFor('customer.addresses.create') },
    },
    {
      title: 'Pesan penjemputan pertama',
      text: 'Pilih barang dan jadwal, kurir datang ke alamat Anda.',
      done: false,
      action: { label: 'Pesan sekarang', href: urlFor('customer.order.create') },
    },
    {
      title: 'Bayar setelah tahu harganya',
      text: 'Tagihan muncul di sini dan via WhatsApp setelah barang diperiksa.',
      done: false,
      action: null,
    },
  ]

  return (
    <>
      <Head title="Beranda" />
      <div className="mx-auto box-content max-w-page px-5 pt-6 lg:pt-10">
        <p className="text-sm leading-none font-semibold text-success-foreground lg:hidden">
          Akun Anda siap
        </p>
        <h1 className="mt-2 text-[28px] leading-[1.15] font-bold tracking-[-0.02em] lg:mt-0 lg:text-[34px]">
          Selamat datang, {user.firstName}
        </h1>
        <p className="mt-2 text-[15px] leading-normal text-foreground-secondary max-lg:hidden">
          Akun Anda siap. Berikut cara memulai.
        </p>
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
          <div className="flex flex-col gap-4 lg:gap-6">
            <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-1 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-accent text-info-foreground sm:size-16">
                <IconTruckDelivery className="size-7" />
              </span>
              <div className="flex flex-1 flex-col gap-1.5">
                <h2 className="text-xl leading-[1.25] font-bold tracking-[-0.01em] sm:text-[22px]">
                  Pesan penjemputan pertama Anda
                </h2>
                <p className="text-[15px] leading-normal text-foreground-secondary">
                  Kurir menjemput sepatu, tas, atau helm Anda. Bayar setelah tahu harganya.
                </p>
              </div>
              <LinkButton href={urlFor('customer.order.create')} className="px-6 max-sm:h-cta">
                Pesan Penjemputan
              </LinkButton>
            </section>
            <section
              aria-labelledby="start-steps-title"
              className="flex flex-col rounded-lg border border-border bg-card px-5 pt-5 pb-2 sm:px-6"
            >
              <h2 id="start-steps-title" className="text-base leading-[1.3] font-semibold">
                Mulai dalam 3 langkah
              </h2>
              <ol className="mt-2 flex flex-col">
                {steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="flex items-center gap-3.5 border-b border-border py-3.5 last:border-b-0"
                  >
                    <span
                      className={cn(
                        'flex size-9.5 shrink-0 items-center justify-center rounded-full border text-sm leading-none font-semibold',
                        step.done
                          ? 'border-success-solid bg-success-solid text-success-solid-foreground'
                          : 'border-border-strong text-foreground-secondary'
                      )}
                    >
                      {step.done ? <IconCheck className="size-5" /> : index + 1}
                      <span className="sr-only">{step.done ? ' (selesai)' : ''}</span>
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-[15px] leading-[1.3] font-semibold">{step.title}</span>
                      <span className="text-meta leading-[1.45] text-foreground-secondary sm:text-sm">
                        {step.text}
                      </span>
                    </span>
                    {step.action && !step.done && (
                      <LinkButton
                        href={step.action.href}
                        variant="outline"
                        size="compact"
                        className="shrink-0 px-3.5"
                      >
                        {step.action.label}
                      </LinkButton>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          </div>
          <aside className="flex flex-col gap-4">
            <section className="rounded-lg border border-border bg-card p-5">
              <EmptyState
                icon={IconArchive}
                title="Belum ada pesanan"
                description="Pesanan aktif dan riwayat akan muncul di sini setelah Anda memesan."
              />
            </section>
            <Link
              href="/#harga"
              className="flex min-h-14 items-center gap-3 rounded-lg bg-muted px-5 text-[15px] leading-none font-medium text-foreground no-underline hover:bg-accent hover:text-foreground hover:no-underline"
            >
              <IconTag className="size-5.5 text-foreground-secondary" />
              <span className="flex-1">Lihat kisaran harga layanan</span>
              <IconChevronRight className="size-5 text-foreground-secondary" />
            </Link>
          </aside>
        </div>
      </div>
    </>
  )
}

CustomerWelcome.layout = [AccountLayout]
