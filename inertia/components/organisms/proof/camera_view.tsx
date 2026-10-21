import { type ReactNode, type RefObject } from 'react'
import { IconX } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { cameraProblem, type CameraStatus } from '~/lib/proof/camera'
import { cn } from '~/lib/shared/utils'

export function Shutter({
  onShoot,
  isDisabled,
  className,
}: {
  onShoot: () => void
  isDisabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label="Ambil foto"
      onClick={onShoot}
      disabled={isDisabled}
      className={cn(
        'size-18 rounded-full border-4 border-card bg-surface-glass shadow-[inset_0_0_0_3px_var(--surface-inverse)] disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    />
  )
}

export function CloseCameraButton({ onClose }: { onClose: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Tutup kamera"
      onPress={onClose}
      className="rounded-full text-surface-inverse-foreground hover:bg-camera-control data-pressed:bg-camera-control"
    >
      <IconX className="size-6" />
    </Button>
  )
}

export function CameraFeed({
  videoRef,
  status,
  onRetry,
  guide,
  frameClassName,
}: {
  videoRef: RefObject<HTMLVideoElement | null>
  status: CameraStatus
  onRetry: () => void
  guide: ReactNode
  frameClassName: string
}) {
  const problem = cameraProblem(status)
  const isLive = status === 'live'

  return (
    <>
      <video
        ref={videoRef}
        muted
        playsInline
        aria-hidden="true"
        className={cn('absolute inset-0 size-full object-cover', !isLive && 'hidden')}
      />
      <div
        className={cn(
          'absolute flex flex-col items-center justify-center gap-2.5 rounded-lg border-2 border-dashed border-camera-guide p-2.5 text-center',
          frameClassName
        )}
      >
        {problem ? (
          <>
            <span
              role="alert"
              className="max-w-70 text-meta leading-[1.45] text-surface-inverse-foreground"
            >
              {problem}
            </span>
            <Button
              variant="outline"
              size="compact"
              data-surface="light"
              onPress={onRetry}
              className="border-transparent"
            >
              Coba Lagi
            </Button>
          </>
        ) : (
          !isLive && (
            <span className="font-mono text-2xs leading-normal font-medium text-surface-inverse-muted">
              {guide}
            </span>
          )
        )}
      </div>
    </>
  )
}

export function PhotoPreview({
  photo,
  stamp,
  showLabel = true,
  stampClassName,
  className,
}: {
  photo: string
  stamp: string
  showLabel?: boolean
  stampClassName?: string
  className?: string
}) {
  return (
    <div className={cn('stripes relative overflow-hidden', className)}>
      <img
        src={photo}
        alt="Pratinjau foto bukti"
        className="absolute inset-0 size-full object-cover"
      />
      {showLabel && (
        <span className="absolute top-3.5 left-3.5 rounded-xs bg-surface-glass px-1.75 py-1 font-mono text-2xs leading-[1.3] font-medium text-foreground-secondary">
          pratinjau hasil foto
        </span>
      )}
      <span
        className={cn(
          'absolute left-3.5 rounded-xs bg-scrim px-2 py-1.25 font-mono text-2xs leading-[1.3] font-medium text-surface-inverse-foreground',
          stampClassName ?? 'bottom-3'
        )}
      >
        {stamp}
      </span>
    </div>
  )
}
