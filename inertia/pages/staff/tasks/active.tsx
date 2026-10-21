import { useId, useState } from 'react'
import { Head, router } from '@inertiajs/react'
import {
  IconCamera,
  IconCheck,
  IconCircleCheck,
  IconExternalLink,
  IconMapPinCheck,
  IconRotate,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Button, LinkButton } from '~/components/ui/button'
import { FieldError } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import ProofResult from '~/components/molecules/proof_result'
import TaskSteps from '~/components/molecules/task_steps'
import {
  CameraFeed,
  CloseCameraButton,
  PhotoPreview,
  Shutter,
} from '~/components/organisms/proof/camera_view'
import SkipTaskDialog from '~/components/organisms/tasks/skip_task_dialog'
import TaskDetails from '~/components/organisms/tasks/task_details'
import { TaskFinish, TasksCleared } from '~/components/organisms/tasks/task_finish'
import TaskMapPanel from '~/components/organisms/tasks/task_map_panel'
import FlowLayout from '~/components/templates/flow_layout'
import { photoFile, proofStamp, useCamera } from '~/lib/proof/camera'
import { useAccount } from '~/lib/shared/auth'
import { navigationLink, preferences } from '~/lib/staff/preferences'
import { useDeviceLocation } from '~/lib/tasks/location'
import { TASK_COPY, TASK_STEPS, type Task, type TaskKind } from '~/lib/tasks/queue'
import { useDrivingRoute } from '~/lib/tasks/route'

type CameraPhase = 'off' | 'live' | 'preview'

const HINTS = {
  nav: ['Menuju lokasi', 'Ikuti rute di peta. Tekan Saya Sudah Sampai saat tiba.'],
  cam: ['Ambil foto bukti', 'Pastikan semua barang terlihat jelas di bingkai.'],
  preview: ['Periksa foto', 'Foto sudah jelas? Pakai foto ini atau ulangi.'],
} as const

type TaskResult = {
  kind: TaskKind
  code: string
  isSkipped: boolean
  reason: string | null
  task: Task
  receiver: string | null
  time: string
}

export default function ActiveTask({
  kind,
  task,
  phase: serverPhase,
  next,
  skipReasons,
  result,
}: {
  kind: TaskKind
  task: Task | null
  phase: 'nav' | 'arrived'
  next: Task | null
  skipReasons: string[]
  result: TaskResult | null
}) {
  const account = useAccount()
  const copy = TASK_COPY[kind]
  const noun = copy.noun
  const { mapApp } = preferences.use()
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>('off')
  const [pending, setPending] = useState<{ photo: string; stamp: string } | null>(null)
  const [shot, setShot] = useState<{ photo: string; stamp: string } | null>(null)
  const [isSkipOpen, setSkipOpen] = useState(false)
  const [isBusy, setBusy] = useState(false)
  const [receiver, setReceiver] = useState<string | null>(null)
  const [receiverError, setReceiverError] = useState<string | null>(null)
  const receiverId = useId()
  const camera = useCamera(cameraPhase === 'live')
  const me = useDeviceLocation(true)

  const phase =
    cameraPhase === 'live'
      ? 'cam'
      : cameraPhase === 'preview'
        ? 'preview'
        : shot
          ? 'shot'
          : serverPhase
  const showMap = Boolean(task) && !result && phase !== 'cam' && phase !== 'preview'
  const driving = useDrivingRoute(me.point, task?.point ?? null, showMap)
  const queueHref = urlFor(kind === 'jemput' ? 'staff.pickups' : 'staff.deliveries')

  const busy = { onStart: () => setBusy(true), onFinish: () => setBusy(false) }

  function post(action: 'arrive' | 'release', onSuccess?: () => void) {
    if (!task) {
      return
    }
    const route = action === 'arrive' ? 'staff.task.arrive' : 'staff.task.release'
    router.post(urlFor(route, { kind, code: task.ref }), {}, { ...busy, onSuccess })
  }

  if (result) {
    const isSuccessful = !result.isSkipped
    return (
      <FlowLayout>
        <Head title={`${noun} ${isSuccessful ? 'selesai' : 'dilewati'}`} />
        <main className="min-h-dvh bg-card">
          <TaskFinish
            noun={noun}
            isSuccessful={isSuccessful}
            name={`${result.task.full} · ${result.task.ref}`}
            meta={`${kind === 'antar' ? `Diterima ${result.receiver ?? ''}` : `${result.task.count} barang dijemput`} · ${result.time} · foto bukti tersimpan`}
            reason={result.reason}
            next={task ?? next}
            nextNumber={1}
            onContinue={() => router.visit(queueHref)}
          />
        </main>
      </FlowLayout>
    )
  }

  if (!task) {
    return (
      <FlowLayout>
        <Head title={copy.title} />
        <main className="min-h-dvh bg-card">
          {next ? (
            <TaskFinish
              noun={noun}
              isSuccessful
              name="Belum ada tugas yang Anda mulai"
              meta="Mulai tugas dari antrean."
              reason={null}
              next={next}
              nextNumber={1}
              onContinue={() => router.visit(queueHref)}
            />
          ) : (
            <TasksCleared noun={noun} />
          )}
        </main>
      </FlowLayout>
    )
  }

  const step = { nav: 0, arrived: 1, cam: 2, preview: 2, shot: 3 }[phase as string] ?? 0
  const headline =
    phase === 'arrived'
      ? [
          'Sudah sampai',
          kind === 'antar'
            ? 'Serahkan barang, catat nama penerima, lalu ambil foto bukti.'
            : 'Terima barang dan cocokkan jumlahnya, lalu ambil foto bukti.',
        ]
      : phase === 'shot'
        ? ['Foto bukti tersimpan', `Langkah terakhir: selesaikan ${noun.toLowerCase()}.`]
        : HINTS[phase as keyof typeof HINTS]
  const externalHref = navigationLink(task.point, mapApp)
  const externalLabel = `Buka di ${mapApp}`
  const receiverValue = receiver ?? task.receiver ?? ''
  const current = task
  const eta = driving.route?.durationText ?? task.eta
  const distance = driving.route?.distanceText ?? task.km
  const arrival = driving.route?.arrivalText ?? task.at
  const photoTitle = `Foto bukti ${noun.toLowerCase()}`

  async function shoot() {
    const photo = await camera.capture()
    if (!photo) {
      return
    }
    setPending({ photo, stamp: proofStamp(current.ref, account.name) })
    setCameraPhase('preview')
  }

  function acceptPhoto() {
    setShot(pending)
    setPending(null)
    setCameraPhase('off')
  }

  async function complete() {
    if (kind === 'antar' && receiverValue.trim().length < 2) {
      setReceiverError('Isi nama penerima barang.')
      return
    }
    if (!shot || isBusy) {
      return
    }
    setBusy(true)
    const photo = await photoFile(shot.photo)
    router.post(
      urlFor('staff.task.complete', { kind, code: current.ref }),
      { photo, ...(kind === 'antar' ? { receiver: receiverValue.trim() } : {}) },
      {
        forceFormData: true,
        onSuccess: () => setShot(null),
        onError: (errors) => setReceiverError(errors.receiver ?? null),
        onFinish: () => setBusy(false),
      }
    )
  }

  return (
    <FlowLayout>
      <Head title={`${copy.short} · ${task.ref}`} />
      <main className="min-h-dvh bg-card lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <div
          data-surface="inverse"
          className="relative h-95 min-w-0 bg-surface-inverse lg:sticky lg:top-0 lg:h-160"
        >
          {showMap && (
            <TaskMapPanel
              me={me.point}
              destination={task.point}
              route={driving.route?.path ?? null}
              hasRouteFailed={driving.failed}
              backHref={queueHref}
              chip={`${copy.short} · ${task.ref}`}
              externalHref={externalHref}
              externalLabel={externalLabel}
              skipLabel={`Lewati ${noun}`}
              onSkip={() => setSkipOpen(true)}
            />
          )}
          {phase === 'cam' && (
            <div className="absolute inset-0">
              <CameraFeed
                videoRef={camera.videoRef}
                status={camera.status}
                onRetry={camera.retry}
                frameClassName="inset-x-[9%] top-15 bottom-30"
                guide={
                  <>
                    tampilan kamera belakang
                    <br />
                    semua barang masuk bingkai
                  </>
                }
              />
              <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 p-2">
                <CloseCameraButton onClose={() => setCameraPhase('off')} />
                <span className="flex-1 text-center text-sm leading-[1.3] font-semibold text-surface-inverse-foreground">
                  {photoTitle}
                </span>
                <span className="w-11" />
              </div>
              <div className="absolute inset-x-0 bottom-8.5 flex justify-center">
                <Shutter onShoot={shoot} isDisabled={!camera.canCapture} />
              </div>
            </div>
          )}
          {phase === 'preview' && pending && (
            <PhotoPreview
              photo={pending.photo}
              stamp={pending.stamp}
              stampClassName="bottom-8"
              className="absolute inset-0"
            />
          )}
        </div>

        <div className="relative -mt-4.5 flex min-w-0 flex-col gap-4 rounded-t-xl bg-card px-5 pt-2.5 pb-6 shadow-sheet lg:m-0 lg:min-h-160 lg:rounded-none lg:border-l lg:border-border lg:shadow-none">
          <span
            aria-hidden="true"
            className="h-1 w-9 self-center rounded-xs bg-border-strong lg:hidden"
          />
          <TaskSteps steps={TASK_STEPS} current={step} />
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl leading-[1.25] font-bold">{headline[0]}</h1>
              <p className="mt-1 text-sm leading-[1.45] text-pretty text-foreground-secondary">
                {headline[1]}
              </p>
            </div>
            {phase === 'nav' && (
              <div className="shrink-0 text-right">
                <p className="text-2xl leading-none font-bold text-success-foreground">{eta}</p>
                <p className="mt-1 text-meta leading-[1.4] font-medium text-foreground-secondary">
                  {distance} · tiba ±{arrival}
                </p>
              </div>
            )}
          </div>

          <TaskDetails task={task} kind={kind} />

          {kind === 'antar' && phase !== 'nav' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor={receiverId}>Diterima oleh</Label>
              <Input
                id={receiverId}
                value={receiverValue}
                aria-invalid={receiverError ? true : undefined}
                aria-describedby={receiverError ? `${receiverId}-error` : undefined}
                onChange={(event) => {
                  setReceiver(event.target.value.slice(0, 80))
                  setReceiverError(null)
                }}
              />
              {receiverError && <FieldError id={`${receiverId}-error`}>{receiverError}</FieldError>}
            </div>
          )}

          {phase === 'nav' && (
            <div className="flex flex-col gap-1">
              <Button size="cta" onPress={() => post('arrive')} isPending={isBusy}>
                <IconMapPinCheck />
                Saya Sudah Sampai
              </Button>
              {!driving.failed && (
                <LinkButton
                  variant="ghost"
                  size="desktop"
                  className="text-[14.5px] text-primary"
                  href={externalHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {externalLabel}
                  <IconExternalLink className="size-4.25" />
                </LinkButton>
              )}
              <Button
                variant="ghost"
                size="desktop"
                className="text-[14.5px] text-foreground-secondary"
                onPress={() => post('release')}
                isDisabled={isBusy}
              >
                Lepaskan Tugas
              </Button>
            </div>
          )}

          {phase === 'arrived' && (
            <div className="flex flex-col gap-1.5">
              <Button size="cta" onPress={() => setCameraPhase('live')}>
                <IconCamera />
                Ambil Foto {noun}
              </Button>
              <span className="text-center text-caption leading-[1.4] text-muted-foreground">
                Kamera perangkat saja · tanpa galeri atau file
              </span>
            </div>
          )}

          {phase === 'cam' && (
            <div className="flex flex-col gap-2">
              <span className="text-center text-note leading-[1.4] text-foreground-secondary">
                Tekan tombol rana di layar kamera.
              </span>
              <Button
                variant="outline"
                onPress={() => setCameraPhase('off')}
                className="text-[15px]"
              >
                Batal
              </Button>
            </div>
          )}

          {phase === 'preview' && (
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                size="cta"
                onPress={() => setCameraPhase('live')}
                className="text-[15px]"
              >
                <IconRotate />
                Ulangi
              </Button>
              <Button size="cta" onPress={acceptPhoto} className="text-[15px]">
                <IconCheck />
                Pakai Foto
              </Button>
            </div>
          )}

          {phase === 'shot' && shot && (
            <div className="flex flex-col gap-2.5">
              <ProofResult
                title={photoTitle}
                photo={shot.photo}
                stamp={shot.stamp}
                onRetake={() => setCameraPhase('live')}
              />
              <Button variant="success" size="cta" onPress={complete} isPending={isBusy}>
                <IconCircleCheck />
                {isBusy ? 'Menyimpan…' : `Selesaikan ${noun}`}
              </Button>
            </div>
          )}
        </div>
      </main>
      <SkipTaskDialog
        isOpen={isSkipOpen}
        onOpenChange={setSkipOpen}
        noun={noun}
        reasons={skipReasons}
        isPending={isBusy}
        onSkip={(reason, note) => {
          setCameraPhase('off')
          router.post(
            urlFor('staff.task.skip', { kind, code: current.ref }),
            { reason, ...(note.trim() ? { note: note.trim() } : {}) },
            { ...busy, onSuccess: () => setSkipOpen(false) }
          )
        }}
      />
    </FlowLayout>
  )
}
