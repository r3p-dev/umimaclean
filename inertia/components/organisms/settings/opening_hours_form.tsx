import { useState, type SyntheticEvent } from 'react'
import { router, usePage } from '@inertiajs/react'
import { IconCopy, IconDeviceFloppy } from '@tabler/icons-react'
import { cn } from 'cn'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import { TimeInput } from '~/components/molecules/time_fields'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { FieldError } from '~/components/ui/field'
import { Switch } from '~/components/ui/switch'
import { DAY_NAMES } from '~/lib/store/days'

type Day = Data.OpeningHours['days'][number]

// The weekly hours (OWN-8). The temporary closure has its own card and is sent back as saved.
export default function OpeningHoursForm({ hours }: { hours: Data.OpeningHours }) {
  const errors: Record<string, string> = usePage().props.errors ?? {}
  const [days, setDays] = useState(hours.days)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateDay(day: number, change: Partial<Day>) {
    setDays((previous) =>
      previous.map((entry) => (entry.day === day ? { ...entry, ...change } : entry))
    )
  }

  // "Samakan Selasa–Sabtu dengan Senin": Tuesday to Saturday take Monday's hours.
  function copyMonday() {
    setDays((previous) => {
      const monday = previous.find((entry) => entry.day === 1)!
      return previous.map((entry) =>
        entry.day >= 2 && entry.day <= 6
          ? { ...entry, isOpen: monday.isOpen, opens: monday.opens, closes: monday.closes }
          : entry
      )
    })
  }

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    router.put(
      urlFor('admin.settings.hours.update'),
      { days, closure: hours.closure },
      { preserveScroll: true, onFinish: () => setIsSubmitting(false) }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jam operasional</CardTitle>
        <CardDescription>
          Dipakai di struk, pesan WhatsApp, dan beranda pelanggan. Slot penjemputan hanya bisa
          dipilih di hari buka.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {days.map((entry, index) => {
              const name = DAY_NAMES[entry.day - 1]
              const error =
                errors[`days.${index}.opens`] ??
                errors[`days.${index}.closes`] ??
                errors[`days.${index}`]
              return (
                <li key={entry.day} className="flex flex-col gap-2 py-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex flex-1 items-center gap-3 sm:flex-none">
                      <span className="w-16 font-semibold text-foreground">{name}</span>
                      <span
                        className={cn(
                          'ml-auto w-10 text-sm sm:ml-0',
                          entry.isOpen ? 'font-medium text-green-700' : 'text-muted-foreground'
                        )}
                      >
                        {entry.isOpen ? 'Buka' : 'Tutup'}
                      </span>
                      <Switch
                        isSelected={entry.isOpen}
                        onChange={(isOpen) => updateDay(entry.day, { isOpen })}
                        aria-label={`Buka hari ${name}`}
                      />
                    </div>
                    {entry.isOpen && (
                      <div className="flex min-w-0 basis-full items-center gap-2 sm:basis-auto">
                        <TimeInput
                          value={entry.opens}
                          onChange={(opens) => updateDay(entry.day, { opens })}
                          label={`Jam buka hari ${name}`}
                          isInvalid={Boolean(error)}
                          className="flex-1 sm:w-28 sm:flex-none"
                        />
                        <span className="text-sm text-muted-foreground">sampai</span>
                        <TimeInput
                          value={entry.closes}
                          onChange={(closes) => updateDay(entry.day, { closes })}
                          label={`Jam tutup hari ${name}`}
                          isInvalid={Boolean(error)}
                          className="flex-1 sm:w-28 sm:flex-none"
                        />
                      </div>
                    )}
                  </div>
                  {error && <FieldError>{error}</FieldError>}
                </li>
              )
            })}
          </ul>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onPress={copyMonday}
              className="h-auto min-h-9 py-1.5 whitespace-normal"
            >
              <IconCopy aria-hidden="true" className="mr-1.5 size-4" />
              Samakan Selasa–Sabtu dengan Senin
            </Button>
            <Button type="submit" isDisabled={isSubmitting}>
              <IconDeviceFloppy aria-hidden="true" className="mr-1.5 size-4" />
              Simpan Jam Buka
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
