import { useId, useState } from 'react'
import { Head } from '@inertiajs/react'
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
import DemoSwitcher from '~/components/organisms/demo_switcher'
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
import { proofStamp, useCamera } from '~/lib/proof/camera'
import { navigationLink, preferences } from '~/lib/staff/preferences'
import { resetTasks, useWorkday } from '~/lib/staff/workday'
import { useDeviceLocation } from '~/lib/tasks/location'
import {
  arriveAtTask,
  completeTask,
  continueTasks,
  keepTaskShot,
  skipTask,
  taskQueue,
} from '~/lib/tasks/progress'
import { SKIP_REASONS, TASK_COPY, TASK_STEPS, type TaskKind } from '~/lib/tasks/queue'
import { useDrivingRoute } from '~/lib/tasks/route'

type CameraPhase = 'off' | 'live' | 'preview'

const HINTS = {
  nav: ['Menuju lokasi', 'Ikuti rute di peta. Tekan Saya Sudah Sampai saat tiba.'],
  cam: ['Ambil foto bukti', 'Pastikan semua barang terlihat jelas di bingkai.'],
  preview: ['Periksa foto', 'Foto sudah jelas? Pakai foto ini atau ulangi.'],
} as const

export default function ActiveTask({ kind: rawKind }: { kind: string }) {
  const kind: TaskKind = rawKind === 'antar' ? 'antar' : 'jemput'
  const copy = TASK_COPY[kind]
  const noun = copy.noun
  const day = useWorkday()
  const { mapApp } = preferences.use()
  const queue = taskQueue(day, kind)
  const task = queue.current
  const progress = queue.progress
  const [cameraPhase, setCameraPhase] = useState<CameraPhase>('off')
  const [pending, setPending] = useState<{ photo: string; stamp: string } | null>(null)
  const [skipOpen, setSkipOpen] = useState(false)
  const [receiver, setReceiver] = useState<string | null>(null)
  const [receiverError, setReceiverError] = useState(false)
  const receiverId = useId()
  const camera = useCamera(cameraPhase === 'live')
  const me = useDeviceLocation(true)

  const finished = (progress.phase === 'done' || progress.phase === 'skipped') && progress.done > 0
  const phase =
    cameraPhase === 'live' ? 'cam' : cameraPhase === 'preview' ? 'preview' : progress.phase
  const showMap = Boolean(task) && !finished && phase !== 'cam' && phase !== 'preview'
  const driving = useDrivingRoute(me.point, task?.point ?? null, showMap)
  const queueHref = urlFor(kind === 'jemput' ? 'staff.pickups' : 'staff.deliveries')

  const demo = (
    <DemoSwitcher
      className="sm:right-3 sm:left-auto"
      label={`Data contoh ${copy.short.toLowerCase()}`}
      options={[
        { value: 'keep', label: 'Data saat ini' },
        { value: 'reset', label: 'Ulangi antrean' },
      ]}
      value="keep"
      onChange={(value) => {
        if (value === 'reset') {
          setCameraPhase('off')
          resetTasks(kind)
        }
      }}
    />
  )

  if (finished) {
    const index = progress.done - 1
    const previous = queue.tasks[index]
    const ok = progress.phase === 'done'
    const time = progress.finishedAt[index] ?? previous.doneAt
    return (
      <FlowLayout>
        <Head title={`${noun} ${ok ? 'selesai' : 'dilewati'}`} />
        <main className="min-h-dvh bg-card">
          <TaskFinish
            noun={noun}
            ok={ok}
            name={`${previous.full} · ${previous.ref}`}
            meta={`${kind === 'antar' ? `Diterima ${progress.receivers[index] ?? previous.receiver}` : `${previous.count} barang dijemput`} · ${time} · foto bukti tersimpan`}
            reason={ok ? null : SKIP_REASONS[progress.skips[index]]}
            next={task}
            nextNumber={progress.done + 1}
            onContinue={() => continueTasks(kind)}
          />
        </main>
        {demo}
      </FlowLayout>
    )
  }

  if (!task) {
    return (
      <FlowLayout>
        <Head title={copy.title} />
        <main className="min-h-dvh bg-card">
          <TasksCleared noun={noun} />
        </main>
        {demo}
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
  const eta = driving.route?.durationText ?? task.eta
  const distance = driving.route?.distanceText ?? task.km
  const arrival = driving.route?.arrivalText ?? task.at
  const photoTitle = `Foto bukti ${noun.toLowerCase()}`

  async function shoot() {
    const photo = await camera.capture()
    if (!photo || !task) return
    setPending({ photo, stamp: proofStamp(task.ref) })
    setCameraPhase('preview')
  }

  function acceptPhoto() {
    keepTaskShot(kind, pending)
    setPending(null)
    setCameraPhase('off')
  }

  function complete() {
    if (kind === 'antar' && !receiverValue.trim()) {
      setReceiverError(true)
      return
    }
    setReceiver(null)
    completeTask(kind, kind === 'antar' ? receiverValue.trim() : undefined)
  }

  return (
    <FlowLayout>
      <Head title={`${copy.short} #${progress.done + 1}`} />
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
              routeFailed={driving.failed}
              backHref={queueHref}
              chip={`${copy.short} #${progress.done + 1} dari ${queue.tasks.length}`}
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
                <Shutter onShoot={shoot} disabled={!camera.canCapture} />
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
                aria-invalid={receiverError || undefined}
                aria-describedby={receiverError ? `${receiverId}-error` : undefined}
                onChange={(event) => {
                  setReceiver(event.target.value)
                  setReceiverError(false)
                }}
              />
              {receiverError && (
                <FieldError id={`${receiverId}-error`}>Isi nama penerima barang.</FieldError>
              )}
            </div>
          )}

          {phase === 'nav' && (
            <div className="flex flex-col gap-1">
              <Button size="cta" onPress={() => arriveAtTask(kind)}>
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

          {phase === 'shot' && progress.shot && (
            <div className="flex flex-col gap-2.5">
              <ProofResult
                title={photoTitle}
                photo={progress.shot.photo}
                stamp={progress.shot.stamp}
                onRetake={() => setCameraPhase('live')}
              />
              <Button variant="success" size="cta" onPress={complete}>
                <IconCircleCheck />
                Selesaikan {noun}
              </Button>
            </div>
          )}
        </div>
      </main>
      <SkipTaskDialog
        open={skipOpen}
        onOpenChange={setSkipOpen}
        noun={noun}
        onSkip={(reason) => {
          setSkipOpen(false)
          setCameraPhase('off')
          skipTask(kind, reason)
        }}
      />
      {demo}
    </FlowLayout>
  )
}
