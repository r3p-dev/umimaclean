import { useEffect, useState, type ComponentProps, type SyntheticEvent } from 'react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconArrowRight,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconHelpCircleFilled,
  IconInfoCircle,
  IconSearch,
} from '@tabler/icons-react'
import { cn } from 'cn'
import type { Registry } from '@generated/registry/schema'
import { urlFor } from '~/client'
import Note from '~/components/atoms/note'
import { buttonVariants } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'

type CheckResponse = Registry['area.check']['types']['response']
// The JSON bodies of a refused check: @adonisjs/limiter's 429 and VineJS's 422 (D80).
type ErrorBody = { errors: { message: string }[] }

type Answer = { tone: ComponentProps<typeof Note>['tone']; text: string }

const IDLE: Answer = {
  tone: 'info',
  text: 'Ketik nama kecamatan untuk mengecek apakah alamat Anda bisa dijemput.',
}
const ICONS = {
  info: IconInfoCircle,
  success: IconCircleCheckFilled,
  danger: IconCircleXFilled,
  attention: IconHelpCircleFilled,
}
// Checks start once the guest pauses typing; every pause is one request within D80's limit.
const TYPING_PAUSE_MS = 400

async function askArea(name: string, signal: AbortSignal): Promise<Answer> {
  const response = await fetch(urlFor('area.check', {}, { qs: { q: name } }), {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (response.status === 429 || response.status === 422) {
    const body: ErrorBody = await response.json()
    return { tone: 'attention', text: body.errors[0].message }
  }
  if (!response.ok) {
    return { tone: 'attention', text: 'Pengecekan gagal. Coba lagi.' }
  }

  const { area }: CheckResponse = await response.json()
  if (!area) {
    return {
      tone: 'attention',
      text: 'Kecamatan tidak ditemukan. Coba ketik nama kecamatan lain, mis. Sukajadi atau Bojongsoang.',
    }
  }
  return area.isCovered
    ? {
        tone: 'success',
        text: `Kec. ${area.name}, ${area.city} masuk area layanan. Antar-jemput gratis.`,
      }
    : {
        tone: 'danger',
        text: `Kec. ${area.name}, ${area.city} belum masuk area layanan. Hubungi kami via WhatsApp untuk info perluasan area.`,
      }
}

// GUEST-1: a guest types a kecamatan and reads one line back (D100), then orders from the same card.
export default function AreaCheckForm() {
  const [name, setName] = useState('')
  const [checkNow, setCheckNow] = useState(0)
  const [answer, setAnswer] = useState<Answer>(IDLE)

  useEffect(() => {
    if (name.trim().length < 3) {
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(
      () => {
        askArea(name.trim(), controller.signal)
          .then(setAnswer)
          .catch((error: unknown) => {
            // A newer keystroke aborted this check; its answer no longer matters.
            if (controller.signal.aborted) return
            console.error(error)
            setAnswer({
              tone: 'attention',
              text: 'Pengecekan gagal. Periksa koneksi Anda lalu coba lagi.',
            })
          })
      },
      checkNow > 0 ? 0 : TYPING_PAUSE_MS
    )
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [name, checkNow])

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault()
    setCheckNow((count) => count + 1)
  }

  // Fewer than three letters is the server's minimum (D100): show the hint instead of an old answer.
  const shown = name.trim().length < 3 ? IDLE : answer
  const Icon = ICONS[shown.tone]
  return (
    <form
      id="cek-area"
      onSubmit={handleSubmit}
      className="flex max-w-lg flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"
    >
      <Label htmlFor="area-name" className="text-base leading-snug font-semibold">
        Cek dulu, alamat Anda bisa dijemput?
      </Label>
      <div className="relative">
        <IconSearch
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id="area-name"
          value={name}
          onChange={(event) => {
            setCheckNow(0)
            setName(event.target.value)
          }}
          placeholder="Ketik kecamatan, mis. Coblong"
          autoComplete="off"
          maxLength={60}
          enterKeyHint="search"
          className="h-12 bg-card pl-11 text-base"
        />
      </div>
      <div role="status" aria-live="polite">
        <Note
          tone={shown.tone}
          variant="plain"
          icon={<Icon aria-hidden="true" className="mt-px size-4.5 shrink-0" />}
        >
          {shown.text}
        </Note>
      </div>
      <Link
        route="register.create"
        className={cn(buttonVariants({ className: 'h-14 w-full gap-2 text-base' }))}
      >
        Pesan Penjemputan
        <IconArrowRight aria-hidden="true" className="size-5" />
      </Link>
    </form>
  )
}
