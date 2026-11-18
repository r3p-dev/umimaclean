import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { IconCopy, IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react'
import { cn } from 'cn'
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import NumberStepper from '~/components/molecules/number_stepper'
import { TimeInput } from '~/components/molecules/time_fields'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { FieldError } from '~/components/ui/field'
import { Switch } from '~/components/ui/switch'
import { DAY_NAMES } from '~/lib/store/days'

type Slot = Data.PickupSlot
type DraftSlot = Omit<Slot, 'id' | 'weekday'> & { id?: number; key: string }

const SHORT_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const NEW_SLOT_CAPACITY = 6

function range(slot: { startsAt: string; endsAt: string }) {
  return `${slot.startsAt.replace(':', '.')}–${slot.endsAt.replace(':', '.')}`
}

function byStart(first: { startsAt: string }, second: { startsAt: string }) {
  return first.startsAt.localeCompare(second.startsAt)
}

// Pickup slots per weekday (SLOT-2, D106). The page remounts this card with a fresh draft after
// every save, so the draft always starts from the saved slots of the chosen day.
export default function PickupSlotsCard({
  slots,
  openDays,
  day,
  onDayChange,
}: {
  slots: Slot[]
  openDays: number[]
  day: number
  onDayChange: (day: number) => void
}) {
  const errors: Record<string, string> = usePage().props.errors ?? {}
  const saved = slots.filter((slot) => slot.weekday === day)
  const [draft, setDraft] = useState<DraftSlot[]>(() =>
    saved.map(({ weekday: _weekday, ...slot }) => ({ ...slot, key: String(slot.id) }))
  )
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const name = DAY_NAMES[day - 1]
  const isOpen = openDays.includes(day)
  const isDirty =
    JSON.stringify(draft.map(({ key: _key, ...slot }) => slot)) !==
    JSON.stringify(saved.map(({ weekday: _weekday, ...slot }) => slot))
  const listError = errors.slots ?? errors['params.weekday']

  function updateSlot(key: string, change: Partial<DraftSlot>) {
    setDraft((previous) =>
      previous.map((slot) => (slot.key === key ? { ...slot, ...change } : slot))
    )
  }

  function addSlot() {
    setDraft((previous) =>
      [
        ...previous,
        {
          key: `new-${previous.length}-${startsAt}`,
          startsAt,
          endsAt,
          capacity: NEW_SLOT_CAPACITY,
          isActive: true,
        },
      ].sort(byStart)
    )
    setStartsAt('')
    setEndsAt('')
  }

  function save() {
    setIsSubmitting(true)
    router.put(
      urlFor('admin.settings.slots.update', { weekday: day }),
      { slots: draft.map(({ key: _key, ...slot }) => slot) },
      { preserveScroll: true, onFinish: () => setIsSubmitting(false) }
    )
  }

  function copyToOtherDays() {
    setIsSubmitting(true)
    router.post(
      urlFor('admin.settings.slots.copy', { weekday: day }),
      {},
      { preserveScroll: true, onFinish: () => setIsSubmitting(false) }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Slot penjemputan</CardTitle>
        <CardDescription>
          Diatur per hari. Kapasitas = jumlah penjemputan per slot; slot penuh tetap terlihat tapi
          nonaktif bagi pelanggan. Hari tutup mengikuti jam operasional.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ToggleButtonGroup
          aria-label="Hari"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[String(day)]}
          onSelectionChange={(keys) => {
            const [key] = [...keys]
            if (key) onDayChange(Number(key))
          }}
          className="grid grid-cols-7 gap-1.5"
        >
          {SHORT_NAMES.map((short, index) => {
            const weekday = index + 1
            const isDayOpen = openDays.includes(weekday)
            const count = slots.filter((slot) => slot.weekday === weekday).length
            return (
              <ToggleButton
                key={short}
                id={String(weekday)}
                isDisabled={!isDayOpen}
                aria-label={`${DAY_NAMES[index]}, ${isDayOpen ? `${count} slot` : 'tutup'}`}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center rounded-md border border-border bg-card px-1 text-sm outline-none',
                  'focus-visible:ring-3 focus-visible:ring-ring/50 data-selected:border-primary data-selected:bg-accent data-selected:text-accent-foreground',
                  'data-disabled:bg-muted data-disabled:text-muted-foreground'
                )}
              >
                <span className="font-semibold">{short}</span>
                <span className="text-xs">
                  {isDayOpen ? (
                    <>
                      {count}
                      {/* The word only where it fits; the button's label always says it. */}
                      <span className="hidden sm:inline"> slot</span>
                    </>
                  ) : (
                    'Tutup'
                  )}
                </span>
              </ToggleButton>
            )
          })}
        </ToggleButtonGroup>

        {isOpen ? (
          <>
            {draft.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                Belum ada slot hari {name}. Pelanggan tidak bisa memilih hari ini.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {draft.map((slot, index) => {
                  const error =
                    errors[`slots.${index}`] ??
                    errors[`slots.${index}.capacity`] ??
                    errors[`slots.${index}.startsAt`] ??
                    errors[`slots.${index}.endsAt`]
                  return (
                    <li
                      key={slot.key}
                      className="flex flex-col gap-2 rounded-lg border border-border p-3"
                    >
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                        <Switch
                          isSelected={slot.isActive}
                          onChange={(isActive) => updateSlot(slot.key, { isActive })}
                          aria-label={`Aktif slot ${range(slot)}`}
                        />
                        <span
                          className={cn(
                            'flex-1 font-semibold tabular-nums',
                            slot.isActive ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {range(slot)}
                          {!slot.isActive && (
                            <span className="ml-2 text-sm font-normal">(nonaktif)</span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Kapasitas</span>
                          <NumberStepper
                            id={`capacity-${slot.key}`}
                            label={`Kapasitas slot ${range(slot)}`}
                            value={slot.capacity}
                            onChange={(capacity) => updateSlot(slot.key, { capacity })}
                            minValue={1}
                            maxValue={20}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Hapus slot ${range(slot)}`}
                            onPress={() =>
                              setDraft((previous) =>
                                previous.filter((entry) => entry.key !== slot.key)
                              )
                            }
                          >
                            <IconTrash aria-hidden="true" className="size-4" />
                          </Button>
                        </div>
                      </div>
                      {error && <FieldError>{error}</FieldError>}
                    </li>
                  )
                })}
              </ul>
            )}
            {listError && <FieldError>{listError}</FieldError>}

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground">Mulai</span>
                <TimeInput
                  value={startsAt}
                  onChange={setStartsAt}
                  label={`Mulai slot baru hari ${name}`}
                  className="w-28"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground">Selesai</span>
                <TimeInput
                  value={endsAt}
                  onChange={setEndsAt}
                  label={`Selesai slot baru hari ${name}`}
                  className="w-28"
                />
              </div>
              <Button
                variant="outline"
                className="h-11"
                isDisabled={!startsAt || !endsAt}
                onPress={addSlot}
              >
                <IconPlus aria-hidden="true" className="mr-1.5 size-4" />
                Tambah slot {name}
              </Button>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:justify-between">
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  className="h-auto min-h-9 py-1.5 whitespace-normal"
                  isDisabled={isDirty || isSubmitting}
                  onPress={copyToOtherDays}
                >
                  <IconCopy aria-hidden="true" className="mr-1.5 size-4" />
                  Salin slot {name} ke hari buka lain
                </Button>
                {isDirty && (
                  <span className="text-xs text-muted-foreground">
                    Simpan dulu sebelum menyalin.
                  </span>
                )}
              </div>
              <Button isDisabled={!isDirty || isSubmitting} onPress={save}>
                <IconDeviceFloppy aria-hidden="true" className="mr-1.5 size-4" />
                Simpan slot {name}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Hari {name} tutup. Buka dulu di jam operasional untuk menambah slot.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
