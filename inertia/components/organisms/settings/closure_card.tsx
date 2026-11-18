import { useState, type SyntheticEvent } from 'react'
import { router, usePage } from '@inertiajs/react'
import { IconBuildingStore, IconCalendarOff, IconTrash } from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import Note from '~/components/atoms/note'
import { DateTimeInput } from '~/components/molecules/time_fields'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { formatStamp } from '~/lib/store/days'

type Closure = Data.OpeningHours['closure']

const PHASE_LABELS = { active: 'Berlangsung', upcoming: 'Terjadwal', ended: 'Selesai' }

// The temporary closure (OWN-8, D103): one at a time, scheduled with a start and an end.
// The weekly hours are sent back as saved, so this card never saves the other card's edits.
export default function ClosureCard({ hours }: { hours: Data.OpeningHours }) {
  const { errors = {}, openingHours } = usePage<Data.SharedProps>().props
  const [draft, setDraft] = useState({ startsAt: null, endsAt: null, note: null } as Omit<
    Closure,
    'isClosed'
  >)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const saved = hours.closure
  const phase = openingHours?.closurePhase ?? null
  const error: string | undefined =
    errors.closure ?? errors['closure.startsAt'] ?? errors['closure.endsAt']

  function save(closure: Closure) {
    setIsSubmitting(true)
    router.put(
      urlFor('admin.settings.hours.update'),
      { days: hours.days, closure },
      { preserveScroll: true, onFinish: () => setIsSubmitting(false) }
    )
  }

  function handleSchedule(event: SyntheticEvent) {
    event.preventDefault()
    save({ isClosed: true, ...draft })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tutup sementara</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {phase === 'active' && openingHours && (
          <Note
            tone="attention"
            icon={<IconBuildingStore aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
          >
            {openingHours.status.label}
            {saved.note && ` · ${saved.note}`}. Pelanggan melihat pengumuman ini dan tidak bisa
            memesan untuk tanggal tersebut.
          </Note>
        )}
        <CardDescription>
          Selama tutup, tanggal tersebut tidak bisa dipilih untuk penjemputan, dan alasannya tampil
          sebagai pengumuman di beranda pelanggan.
        </CardDescription>

        {saved.isClosed && saved.startsAt && saved.endsAt && phase ? (
          <div className="flex items-start gap-3 border-y border-border py-3">
            <IconCalendarOff aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">
                  {formatStamp(saved.startsAt)} – {formatStamp(saved.endsAt)}
                </span>
                <Badge variant={phase === 'active' ? 'secondary' : 'outline'}>
                  {PHASE_LABELS[phase]}
                </Badge>
              </div>
              {saved.note && <span className="text-sm text-muted-foreground">{saved.note}</span>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Hapus tutup sementara"
              isDisabled={isSubmitting}
              onPress={() => save({ ...saved, isClosed: false })}
            >
              <IconTrash aria-hidden="true" className="size-4" />
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSchedule} className="flex flex-col gap-4">
            <h3 className="font-semibold text-foreground">Jadwalkan tutup</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <DateTimeInput
                value={draft.startsAt}
                onChange={(startsAt) => setDraft((previous) => ({ ...previous, startsAt }))}
                isInvalid={Boolean(error)}
                label={<FieldLabel>Dari</FieldLabel>}
              />
              <DateTimeInput
                value={draft.endsAt}
                onChange={(endsAt) => setDraft((previous) => ({ ...previous, endsAt }))}
                isInvalid={Boolean(error)}
                label={<FieldLabel>Sampai</FieldLabel>}
              />
            </div>
            {error && <FieldError>{error}</FieldError>}
            <Field>
              <FieldLabel htmlFor="closure-note">Alasan</FieldLabel>
              <Input
                id="closure-note"
                value={draft.note ?? ''}
                onChange={(event) =>
                  setDraft((previous) => ({ ...previous, note: event.target.value || null }))
                }
                maxLength={100}
                placeholder="mis. Libur Lebaran"
                className="h-11"
              />
              <FieldDescription>Ditampilkan ke pelanggan.</FieldDescription>
              {errors['closure.note'] && <FieldError>{errors['closure.note']}</FieldError>}
            </Field>
            <div>
              <Button type="submit" isDisabled={isSubmitting}>
                <IconCalendarOff aria-hidden="true" className="mr-1.5 size-4" />
                Jadwalkan tutup
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
