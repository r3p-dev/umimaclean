import { useEffect, useRef, useState } from 'react'
import { clockTime, formatDayMonth } from '~/lib/shared/date'
import { shortName } from '~/lib/shared/format'

export type CameraStatus = 'starting' | 'live' | 'denied' | 'unavailable'

type Facing = 'environment' | 'user'

const MAX_WIDTH = 1024

type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean }

function cameraSupported() {
  return typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
}

export async function photoFile(photo: string, name = 'bukti.jpg') {
  const blob = await fetch(photo).then((response) => response.blob())
  return new File([blob], name, { type: blob.type || 'image/jpeg' })
}

export function proofStamp(ref: string, staff: string, withYear = false, date = new Date()) {
  const day = formatDayMonth(date, withYear)
  return withYear
    ? `${day} · ${clockTime(date)} · ${shortName(staff)} · ${ref}`
    : `${day} ${clockTime(date)} · ${shortName(staff)} · ${ref}`
}

function placeholderFrame(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d')
  if (!context) {
    return
  }
  canvas.width = 960
  canvas.height = 720
  const styles = getComputedStyle(document.documentElement)
  const first = styles.getPropertyValue('--media-placeholder-1').trim() || '#e5e7eb'
  const second = styles.getPropertyValue('--media-placeholder-2').trim() || '#f3f4f6'
  context.fillStyle = second
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = first
  context.lineWidth = 14
  for (let offset = -canvas.height; offset < canvas.width; offset += 28) {
    context.beginPath()
    context.moveTo(offset, 0)
    context.lineTo(offset + canvas.height, canvas.height)
    context.stroke()
  }
}

export function useCamera(isActive: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const trackRef = useRef<MediaStreamTrack | null>(null)
  const [status, setStatus] = useState<CameraStatus>('starting')
  const [facing, setFacing] = useState<Facing>('environment')
  const [attempt, setAttempt] = useState(0)
  const [torch, setTorch] = useState({ isSupported: false, isOn: false })
  const isSupported = cameraSupported()

  useEffect(() => {
    if (!isActive || !isSupported) {
      return
    }
    let stream: MediaStream | null = null
    let isCancelled = false

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      .then(async (media) => {
        if (isCancelled) {
          for (const track of media.getTracks()) {
            track.stop()
          }
          return
        }
        stream = media
        const track = media.getVideoTracks()[0] ?? null
        trackRef.current = track
        const capabilities = (track?.getCapabilities?.() ?? {}) as TorchCapabilities
        setTorch({ isSupported: Boolean(capabilities.torch), isOn: false })
        const video = videoRef.current
        if (video) {
          video.srcObject = media
          await video.play().catch(() => undefined)
        }
        setStatus('live')
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return
        }
        const name = error instanceof DOMException ? error.name : ''
        setStatus(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable')
      })

    return () => {
      isCancelled = true
      for (const track of stream?.getTracks() ?? []) {
        track.stop()
      }
      trackRef.current = null
      setStatus('starting')
    }
  }, [isActive, isSupported, facing, attempt])

  async function capture() {
    const canvas = document.createElement('canvas')
    const video = videoRef.current
    if (status === 'live' && video && video.videoWidth) {
      const scale = Math.min(1, MAX_WIDTH / video.videoWidth)
      canvas.width = Math.round(video.videoWidth * scale)
      canvas.height = Math.round(video.videoHeight * scale)
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
    } else if (import.meta.env.DEV) {
      placeholderFrame(canvas)
    } else {
      return null
    }
    return canvas.toDataURL('image/jpeg', 0.72)
  }

  async function toggleTorch() {
    const track = trackRef.current
    if (!track || !torch.isSupported) {
      return
    }
    const isNextOn = !torch.isOn
    await track
      .applyConstraints({ advanced: [{ torch: isNextOn } as MediaTrackConstraintSet] })
      .then(() => setTorch({ isSupported: true, isOn: isNextOn }))
      .catch(() => undefined)
  }

  return {
    videoRef,
    status: isSupported ? status : ('unavailable' as CameraStatus),
    canCapture: (isSupported && status === 'live') || import.meta.env.DEV,
    capture,
    retry() {
      setStatus('starting')
      setAttempt((value) => value + 1)
    },
    switchCamera() {
      setFacing((value) => (value === 'environment' ? 'user' : 'environment'))
    },
    torch,
    toggleTorch,
  }
}

export function cameraProblem(status: CameraStatus) {
  if (status === 'denied') {
    return 'Akses kamera ditolak. Izinkan kamera untuk situs ini di pengaturan browser, lalu coba lagi.'
  }
  if (status === 'unavailable') {
    return 'Kamera tidak tersedia di perangkat ini. Gunakan ponsel dengan kamera belakang.'
  }
  return null
}
