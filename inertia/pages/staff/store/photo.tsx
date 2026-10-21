import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import {
  IconBolt,
  IconCamera,
  IconCameraRotate,
  IconCheck,
  IconCloudOff,
  IconLoader2,
  IconRotate,
  IconSend,
  IconShieldCheck,
  IconX,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button, LinkButton } from '~/components/ui/button'
import BarSteps from '~/components/molecules/bar_steps'
import {
  CameraFeed,
  CloseCameraButton,
  PhotoPreview,
  Shutter,
} from '~/components/organisms/proof/camera_view'
import FlowLayout from '~/components/templates/flow_layout'
import { photoFile, proofStamp, useCamera } from '~/lib/proof/camera'
import { useAccount } from '~/lib/shared/auth'
import { MAX_PROOF_PHOTOS, PROOF_KINDS, PROOF_STEPS, isProofKind } from '~/lib/proof/kinds'

type Phase = 'idle' | 'camera' | 'preview' | 'ready' | 'sending' | 'done'

type Shot = { photo: string; stamp: string }

export default function ProofPhoto({ kind: rawKind, number }: { kind: string; number: string }) {
  const account = useAccount()
  const kind = isProofKind(rawKind) ? rawKind : 'intake'
  const copy = PROOF_KINDS[kind]
  const name = copy.name.toLowerCase()
  const reference = number || 'TOKO'
  const [phase, setPhase] = useState<Phase>('idle')
  const [shots, setShots] = useState<Shot[]>([])
  const [pending, setPending] = useState<Shot | null>(null)
  const [hasFailed, setFailed] = useState(false)
  const camera = useCamera(phase === 'camera')
  const position = { idle: 0, camera: 0, preview: 1, ready: 2, sending: 2, done: 3 }[phase]
  const backHref = number
    ? urlFor('staff.inspection', { number })
    : kind === 'intake'
      ? urlFor('staff.walk_in')
      : urlFor('staff.home')
  const backLabel = number
    ? 'Lanjut ke Pemeriksaan'
    : kind === 'intake'
      ? 'Kembali ke Transaksi'
      : 'Kembali ke Beranda'

  async function shoot() {
    const photo = await camera.capture()
    if (!photo) {
      return
    }
    setPending({ photo, stamp: proofStamp(reference, account.name, true) })
    setPhase('preview')
  }

  async function send() {
    if (!number) {
      setFailed(true)
      return
    }
    setPhase('sending')
    const photos = await Promise.all(
      shots.map((shot, index) => photoFile(shot.photo, `barang-${index + 1}.jpg`))
    )
    let isSent = false
    router.post(
      urlFor('staff.walk_in.photos', { number }),
      { photos },
      {
        forceFormData: true,
        onSuccess: () => {
          isSent = true
          setFailed(false)
          setPhase('done')
        },
        onFinish: () => {
          if (!isSent) {
            setFailed(true)
            setPhase('ready')
          }
        },
      }
    )
  }

  return (
    <FlowLayout>
      <Head title={`Foto bukti ${name}`} />
      <main className="flex min-h-dvh flex-col gap-3 bg-background p-4">
        <div className="mx-auto flex w-full max-w-120 flex-col gap-3">
          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <BarSteps
                label="Tahap foto bukti"
                steps={PROOF_STEPS}
                current={position}
                className="grid-cols-3"
              />
            </div>

            {phase === 'idle' && (
              <div className="flex flex-col items-center gap-3.5 px-4.5 pt-6 pb-5 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
                  <IconCamera className="size-7" />
                </span>
                <div className="flex flex-col gap-1">
                  <h1 className="text-base leading-[1.3] font-semibold">Foto bukti {name}</h1>
                  <p className="text-note leading-[1.45] text-foreground-secondary">{copy.hint}</p>
                </div>
                <Button
                  size="cta"
                  onPress={() => setPhase('camera')}
                  className="self-stretch text-[15px]"
                >
                  <IconCamera />
                  {copy.cta}
                </Button>
                <p className="flex items-start gap-1.5 text-left text-caption leading-[1.45] text-muted-foreground">
                  <IconShieldCheck className="mt-0.5 size-3.75 shrink-0" />
                  Hanya dari kamera perangkat. Foto dari galeri atau file tidak bisa dipakai,
                  sehingga waktu pengambilan terjamin asli.
                </p>
              </div>
            )}

            {phase === 'camera' && (
              <div
                data-surface="inverse"
                className="relative aspect-3/4 overflow-hidden bg-surface-inverse"
              >
                <CameraFeed
                  videoRef={camera.videoRef}
                  status={camera.status}
                  onRetry={camera.retry}
                  frameClassName="inset-x-[9%] top-[18%] bottom-[26%]"
                  guide={
                    <>
                      tampilan kamera belakang
                      <br />
                      pastikan semua barang masuk bingkai
                    </>
                  }
                />
                <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 bg-linear-to-b from-scrim-photo to-transparent p-2">
                  <CloseCameraButton onClose={() => setPhase(shots.length ? 'ready' : 'idle')} />
                  <h1 className="flex-1 text-center text-sm leading-[1.3] font-semibold text-surface-inverse-foreground">
                    Foto bukti {name}
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Lampu kilat"
                    aria-pressed={camera.torch.isOn}
                    isDisabled={!camera.torch.isSupported}
                    onPress={camera.toggleTorch}
                    className="rounded-full text-surface-inverse-foreground hover:bg-camera-control disabled:bg-transparent disabled:text-surface-inverse-muted"
                  >
                    <IconBolt className="size-5.5" />
                  </Button>
                </div>
                <div className="absolute inset-x-0 bottom-0 grid grid-cols-[1fr_auto_1fr] items-center bg-linear-to-b from-transparent to-scrim-photo px-4 pt-3.5 pb-4.5">
                  <span className="text-caption leading-[1.3] font-medium text-surface-inverse-foreground">
                    Foto {shots.length + 1} dari maks. {MAX_PROOF_PHOTOS}
                  </span>
                  <Shutter onShoot={shoot} isDisabled={!camera.canCapture} />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Ganti kamera"
                    onPress={camera.switchCamera}
                    className="justify-self-end rounded-full bg-camera-control text-surface-inverse-foreground hover:bg-camera-control"
                  >
                    <IconCameraRotate className="size-5.5" />
                  </Button>
                </div>
              </div>
            )}

            {phase === 'preview' && pending && (
              <>
                <PhotoPreview photo={pending.photo} stamp={pending.stamp} className="aspect-3/4" />
                <div className="flex flex-col gap-2.5 px-4 pt-3.5 pb-4">
                  <p className="text-note leading-[1.45] text-foreground-secondary">
                    Pastikan foto jelas dan semua barang terlihat.
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Button
                      variant="outline"
                      size="cta"
                      onPress={() => setPhase('camera')}
                      className="text-[15px]"
                    >
                      <IconRotate />
                      Ulangi
                    </Button>
                    <Button
                      size="cta"
                      onPress={() => {
                        setShots((current) => [...current, pending].slice(0, MAX_PROOF_PHOTOS))
                        setPending(null)
                        setPhase('ready')
                      }}
                      className="text-[15px]"
                    >
                      <IconCheck />
                      Pakai Foto
                    </Button>
                  </div>
                </div>
              </>
            )}

            {(phase === 'ready' || phase === 'sending') && (
              <div className="flex flex-col gap-3 p-4">
                <ul className="grid grid-cols-3 gap-2">
                  {shots.map((shot, index) => (
                    <li
                      key={shot.photo}
                      className="stripes relative aspect-square overflow-hidden rounded-md"
                    >
                      <img
                        src={shot.photo}
                        alt={`Foto ${index + 1}`}
                        className="absolute inset-0 size-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Hapus Foto ${index + 1}`}
                        isDisabled={phase === 'sending'}
                        onPress={() => {
                          const next = shots.filter((item) => item !== shot)
                          setShots(next)
                          if (!next.length) {
                            setPhase('idle')
                          }
                        }}
                        className="absolute top-1 right-1 rounded-full bg-scrim text-surface-inverse-foreground hover:bg-scrim"
                      >
                        <IconX className="size-4.5" />
                      </Button>
                      <span className="absolute bottom-1.5 left-1.5 rounded-xs bg-surface-glass px-1.25 py-0.75 font-mono text-[10.5px] leading-[1.2] font-medium text-foreground-secondary">
                        Foto {index + 1}
                      </span>
                    </li>
                  ))}
                  {shots.length < MAX_PROOF_PHOTOS && (
                    <li>
                      <button
                        type="button"
                        onClick={() => setPhase('camera')}
                        disabled={phase === 'sending'}
                        className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md border-[1.5px] border-dashed border-input bg-card text-caption leading-[1.2] font-semibold text-info-foreground hover:bg-accent"
                      >
                        <IconCamera className="size-6" />
                        Foto lagi
                      </button>
                    </li>
                  )}
                </ul>
                <p className="text-meta leading-[1.45] text-foreground-secondary">
                  {shots.length} foto siap dikirim. Tampil di halaman lacak pelanggan setelah
                  dikirim.
                </p>
                <Button
                  size="cta"
                  onPress={send}
                  isDisabled={phase === 'sending'}
                  className="text-[15px]"
                >
                  {phase === 'sending' ? <IconLoader2 className="animate-spin" /> : <IconSend />}
                  {phase === 'sending' ? 'Mengirim…' : 'Kirim Bukti'}
                </Button>
              </div>
            )}

            {phase === 'done' && (
              <div className="flex flex-col items-center gap-2.5 px-4.5 pt-6 pb-5 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-success text-success-foreground">
                  <IconCheck className="size-7.5" />
                </span>
                <h1 role="status" className="text-base leading-[1.3] font-semibold">
                  Bukti terkirim
                </h1>
                <p className="text-note leading-normal text-pretty text-foreground-secondary">
                  {shots.length} foto bukti {name} tersimpan ·{' '}
                  {shots[shots.length - 1]?.stamp.split(' · ').slice(0, 2).join(' · ')}. Pelanggan
                  bisa melihatnya di detail pesanan.
                </p>
                <LinkButton variant="ghost" size="desktop" className="text-primary" href={backHref}>
                  {backLabel}
                </LinkButton>
              </div>
            )}
          </section>

          {hasFailed && (
            <div
              role="alert"
              className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-destructive-border-soft bg-destructive-surface px-3 py-2.5"
            >
              <span className="flex size-10 items-center justify-center rounded-inner bg-destructive-subtle text-destructive-text">
                <IconCloudOff className="size-5" />
              </span>
              <div>
                <p className="text-note leading-[1.3] font-semibold">
                  {number ? 'Gagal mengirim foto' : 'Pesanan belum dipilih'}
                </p>
                <p className="text-meta leading-[1.4] text-foreground-secondary">
                  {number
                    ? 'Foto masih ada di layar ini. Periksa sinyal, lalu kirim ulang.'
                    : 'Buka kamera dari Transaksi Offline agar foto tersimpan ke pesanan.'}
                </p>
              </div>
              <Button
                variant="outline"
                size="compact"
                onPress={send}
                className="rounded-inner px-2.5 text-meta"
              >
                Kirim Ulang
              </Button>
            </div>
          )}

          {phase !== 'done' && (
            <LinkButton
              variant="ghost"
              size="desktop"
              className="self-center text-primary"
              href={backHref}
            >
              {backLabel}
            </LinkButton>
          )}
        </div>
      </main>
    </FlowLayout>
  )
}
