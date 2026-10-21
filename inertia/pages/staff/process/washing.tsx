import { useState, type ComponentType, type SVGProps } from 'react'
import { Head, router } from '@inertiajs/react'
import type { Data } from '@generated/data'
import {
  IconArrowDownLeft,
  IconBackpack,
  IconCamera,
  IconCheck,
  IconCircleCheck,
  IconHelmet,
  IconRotate,
  IconShoe,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button, LinkButton } from '~/components/ui/button'
import SourceTag from '~/components/atoms/source_tag'
import ProofResult from '~/components/molecules/proof_result'
import {
  CameraFeed,
  CloseCameraButton,
  PhotoPreview,
  Shutter,
} from '~/components/organisms/proof/camera_view'
import StaffMissingOrder from '~/components/organisms/staff_missing_order'
import StaffTopBar from '~/components/organisms/staff_top_bar'
import StaffLayout from '~/components/templates/staff_layout'
import type { ItemCategory } from '~/lib/processing/catalog'
import { photoFile, proofStamp, useCamera } from '~/lib/proof/camera'
import { useAccount } from '~/lib/shared/auth'
import { cn } from '~/lib/shared/utils'

const ICONS: Record<ItemCategory, ComponentType<SVGProps<SVGSVGElement>>> = {
  Sepatu: IconShoe,
  Tas: IconBackpack,
  Helm: IconHelmet,
}

type CameraPhase = 'off' | 'live' | 'preview'

export default function Washing({ number, order }: { number: string; order: Data.Wash | null }) {
  const account = useAccount()
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>('off')
  const [pending, setPending] = useState<{ photo: string; stamp: string } | null>(null)
  const [localShot, setLocalShot] = useState<{ photo: string; stamp: string } | null>(null)
  const [isBusy, setBusy] = useState(false)
  const camera = useCamera(cameraPhase === 'live')
  const back = { href: urlFor('staff.process'), label: 'Kembali ke Proses' }

  if (!order) {
    return (
      <StaffLayout active="proses">
        <Head title="Detail pencucian" />
        <StaffTopBar title="Detail pencucian" subtitle={number} back={back} variant="detail" />
        <StaffMissingOrder number={number} backHref={back.href} backLabel={back.label} />
      </StaffLayout>
    )
  }

  const isDone = order.isDone
  const shot =
    isDone && order.shot ? { photo: order.shot.url ?? '', stamp: order.shot.stamp } : localShot

  async function complete() {
    if (!localShot || isBusy) {
      return
    }
    setBusy(true)
    const photo = await photoFile(localShot.photo)
    router.post(
      urlFor('staff.washing.complete', { number }),
      { photo },
      { forceFormData: true, onSuccess: () => setLocalShot(null), onFinish: () => setBusy(false) }
    )
  }

  async function shoot() {
    const photo = await camera.capture()
    if (!photo || !order) {
      return
    }
    setPending({ photo, stamp: proofStamp(order.number, account.name) })
    setCameraPhase('preview')
  }

  return (
    <StaffLayout active="proses">
      <Head title={`Pencucian ${order.number}`} />
      <StaffTopBar
        title="Detail pencucian"
        subtitle={`${order.number} · ${order.customer}`}
        back={back}
        variant="detail"
        actions={<SourceTag isInStore={order.source === 'toko'} shape="pill" />}
      />
      <div className="mx-auto flex w-full max-w-180 flex-col gap-3.5 p-4">
        <section className="flex flex-col gap-1.5 rounded-lg border border-border bg-card px-4 py-3.5">
          <span className="text-caption leading-[1.3] font-medium text-muted-foreground">
            Status saat ini
          </span>
          <span role="status" className="flex items-center gap-2.5 text-lg leading-[1.3] font-bold">
            <span
              aria-hidden="true"
              className={cn(
                'size-2.5 shrink-0 rounded-full',
                isDone
                  ? 'bg-success-dot shadow-[0_0_0_4px_var(--success)]'
                  : 'bg-status-cuci-dot shadow-[0_0_0_4px_var(--status-cuci-bg)]'
              )}
            />
            {order.isCollected
              ? 'Sudah diambil pelanggan'
              : order.isWaitingCollection
                ? 'Siap diambil di toko'
                : isDone
                  ? 'Selesai dicuci'
                  : 'Dalam Pencucian'}
          </span>
          <span className="text-note leading-[1.45] text-foreground-secondary">
            {isDone && shot ? `Foto bukti tersimpan · ${shot.stamp}` : order.statusSub}
          </span>
        </section>

        <section className="rounded-lg border border-border bg-card px-4 py-1">
          <h2 className="mt-3 mb-1 text-base leading-[1.3] font-semibold">Barang &amp; layanan</h2>
          {order.items.map((item) => {
            const Icon = ICONS[item.category as ItemCategory]
            return (
              <div key={item.name} className="flex flex-col gap-1.5 border-t border-border py-3">
                <span className="flex items-center gap-2 text-[15px] leading-[1.3] font-semibold">
                  <Icon className="size-5 text-foreground-secondary" />
                  {item.name}
                </span>
                <ul className="flex flex-col gap-1.5">
                  {item.services.map((service) => (
                    <li key={service} className="pl-7 text-sm leading-[1.4]">
                      • {service}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </section>

        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="px-4 pt-3.5">
            <h2 className="text-base leading-[1.3] font-semibold">Foto bukti pencucian</h2>
          </div>

          {cameraPhase === 'live' && (
            <div data-surface="inverse" className="relative mt-3 aspect-4/3 bg-surface-inverse">
              <CameraFeed
                videoRef={camera.videoRef}
                status={camera.status}
                onRetry={camera.retry}
                frameClassName="inset-x-[9%] top-14 bottom-25"
                guide="tampilan kamera belakang"
              />
              <div className="absolute top-2 left-2">
                <CloseCameraButton onClose={() => setCameraPhase('off')} />
              </div>
              <div className="absolute inset-x-0 bottom-4 flex justify-center">
                <Shutter onShoot={shoot} isDisabled={!camera.canCapture} className="size-17" />
              </div>
            </div>
          )}

          {cameraPhase === 'preview' && pending && (
            <>
              <PhotoPreview
                photo={pending.photo}
                stamp={pending.stamp}
                showLabel={false}
                className="mt-3 aspect-4/3"
              />
              <div className="grid grid-cols-2 gap-2.5 px-4 pt-3.5 pb-4">
                <Button
                  variant="outline"
                  size="cta"
                  onPress={() => setCameraPhase('live')}
                  className="text-[15px]"
                >
                  <IconRotate />
                  Ulangi
                </Button>
                <Button
                  size="cta"
                  onPress={() => {
                    setLocalShot(pending)
                    setPending(null)
                    setCameraPhase('off')
                  }}
                  className="text-[15px]"
                >
                  <IconCheck />
                  Pakai Foto
                </Button>
              </div>
            </>
          )}

          {cameraPhase === 'off' && !shot && !isDone && (
            <div className="flex flex-col gap-2.5 px-4 pt-2.5 pb-4">
              <p className="text-sm leading-[1.45] text-foreground-secondary">
                Wajib sebelum pencucian ditandai selesai. Foto semua barang setelah dicuci, sebelum
                dikemas.
              </p>
              <Button size="cta" onPress={() => setCameraPhase('live')}>
                <IconCamera />
                Ambil Foto Hasil Cuci
              </Button>
              <span className="text-center text-caption leading-[1.4] text-muted-foreground">
                Kamera perangkat saja · tanpa galeri atau file
              </span>
            </div>
          )}

          {cameraPhase === 'off' && localShot && !isDone && (
            <div className="flex flex-col gap-2.5 px-4 pt-3 pb-4">
              <ProofResult
                title="Foto bukti pencucian"
                photo={localShot.photo}
                stamp={localShot.stamp}
                onRetake={() => setCameraPhase('live')}
              />
              <Button variant="success" size="cta" onPress={complete} isPending={isBusy}>
                <IconCircleCheck />
                {isBusy ? 'Menyimpan…' : 'Selesaikan Pencucian'}
              </Button>
            </div>
          )}

          {cameraPhase === 'off' && isDone && (
            <div className="flex flex-col gap-2.5 px-4 pt-3 pb-4.5">
              <div
                role="status"
                className="flex flex-col gap-2 rounded-md bg-success p-3.5 text-success-foreground"
              >
                <span className="flex items-center gap-2 text-base leading-[1.3] font-bold">
                  <IconCircleCheck className="size-5.5" />
                  Pencucian selesai
                </span>
                {order.returnMethod === 'delivery' ? (
                  <span className="text-sm leading-[1.45]">
                    Pesanan dipindah ke{' '}
                    <strong className="font-bold tracking-[0.03em]">ANTAR</strong>.
                  </span>
                ) : (
                  <span className="text-sm leading-[1.45]">
                    {order.isCollected
                      ? 'Barang sudah diserahkan ke pelanggan.'
                      : 'Pesanan siap diambil di toko.'}
                  </span>
                )}
              </div>
              {shot && shot.photo && (
                <img
                  src={shot.photo}
                  alt="Foto bukti pencucian"
                  className="aspect-4/3 w-full rounded-md object-cover"
                />
              )}
              {order.isWaitingCollection && (
                <Button
                  size="cta"
                  isPending={isBusy}
                  onPress={() =>
                    router.post(
                      urlFor('staff.collect', { number }),
                      {},
                      {
                        onStart: () => setBusy(true),
                        onFinish: () => setBusy(false),
                      }
                    )
                  }
                >
                  <IconCircleCheck />
                  Serahkan ke Pelanggan
                </Button>
              )}
              <LinkButton
                variant="ghost"
                className="border-[1.5px] border-input text-[15px] text-info-foreground hover:text-info-foreground"
                href={order.returnMethod === 'delivery' ? urlFor('staff.deliveries') : back.href}
              >
                {order.returnMethod === 'delivery' && <IconArrowDownLeft />}
                {order.returnMethod === 'delivery' ? 'Lihat antrean Antar' : 'Kembali ke Proses'}
              </LinkButton>
            </div>
          )}
        </section>
      </div>
    </StaffLayout>
  )
}
