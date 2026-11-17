import { useState, type SyntheticEvent } from 'react'
import { router, usePage } from '@inertiajs/react'
import { IconCalendarTime, IconDeviceFloppy } from '@tabler/icons-react'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { Switch } from '~/components/ui/switch'

// Day 1 is Monday, as the server numbers them (OWN-8).
const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export default function OpeningHoursForm({ hours }: { hours: Data.OpeningHours }) {
  const errors: Record<string, string> = usePage().props.errors ?? {}
  const [form, setForm] = useState(hours)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateDay(day: number, change: Partial<Data.OpeningHours['days'][number]>) {
    setForm((previous) => ({
      ...previous,
      days: previous.days.map((entry) => (entry.day === day ? { ...entry, ...change } : entry)),
    }))
  }

  function updateClosure(change: Partial<Data.OpeningHours['closure']>) {
    setForm((previous) => ({ ...previous, closure: { ...previous.closure, ...change } }))
  }

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    router.put(urlFor('admin.settings.hours.update'), form, {
      preserveScroll: true,
      onFinish: () => setIsSubmitting(false),
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconCalendarTime className="size-5 text-primary" />
          <CardTitle>Jam Buka</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {form.days.map((entry, index) => {
              const name = DAY_NAMES[entry.day - 1]
              const error = errors[`days.${index}.closes`] ?? errors[`days.${index}`]
              return (
                <li key={entry.day} className="flex flex-col gap-2 p-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Switch
                      isSelected={entry.isOpen}
                      onChange={(isOpen) => updateDay(entry.day, { isOpen })}
                      aria-label={`Buka hari ${name}`}
                    />
                    <span className="w-16 font-medium text-foreground">{name}</span>
                    {entry.isOpen ? (
                      <div className="flex min-w-0 flex-1 basis-60 items-center gap-2">
                        <Input
                          type="time"
                          value={entry.opens}
                          onChange={(event) => updateDay(entry.day, { opens: event.target.value })}
                          aria-label={`Jam buka hari ${name}`}
                          className="h-11 min-w-0 flex-1"
                          required
                        />
                        <span aria-hidden="true">–</span>
                        <Input
                          type="time"
                          value={entry.closes}
                          onChange={(event) => updateDay(entry.day, { closes: event.target.value })}
                          aria-label={`Jam tutup hari ${name}`}
                          className="h-11 min-w-0 flex-1"
                          required
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Tutup</span>
                    )}
                  </div>
                  {error && <FieldError>{error}</FieldError>}
                </li>
              )
            })}
          </ul>

          <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
              <Switch
                isSelected={form.closure.isClosed}
                onChange={(isClosed) => updateClosure({ isClosed })}
                aria-label="Tutup sementara"
              />
              <span className="font-medium text-foreground">Tutup sementara</span>
            </div>
            {form.closure.isClosed && (
              <>
                <Field>
                  <FieldLabel htmlFor="closure-until">Tutup sampai tanggal</FieldLabel>
                  <Input
                    id="closure-until"
                    type="date"
                    value={form.closure.until ?? ''}
                    onChange={(event) => updateClosure({ until: event.target.value || null })}
                    className="h-11"
                  />
                  <FieldDescription>Kosongkan bila belum tahu kapan buka lagi.</FieldDescription>
                  {errors['closure.until'] && <FieldError>{errors['closure.until']}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="closure-note">Catatan untuk pelanggan</FieldLabel>
                  <Input
                    id="closure-note"
                    value={form.closure.note ?? ''}
                    onChange={(event) => updateClosure({ note: event.target.value || null })}
                    maxLength={100}
                    placeholder="Contoh: Libur Lebaran"
                    className="h-11"
                  />
                  {errors['closure.note'] && <FieldError>{errors['closure.note']}</FieldError>}
                </Field>
              </>
            )}
          </div>

          <div>
            <Button type="submit" isDisabled={isSubmitting} className="w-full sm:w-auto">
              <IconDeviceFloppy className="mr-1.5 size-4" />
              Simpan Jam Buka
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
