import { useState, type SyntheticEvent } from 'react'
import type { Registry } from '@generated/registry/schema'
import { urlFor } from '~/client'
import Note from '~/components/atoms/note'
import { Button } from '~/components/ui/button'
import { Field, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'

type CheckResponse = Registry['area.check']['types']['response']
// The JSON bodies of a refused check: @adonisjs/limiter's 429 and VineJS's 422 (D80).
type ErrorBody = { errors: { message: string }[] }

type Answer = { tone: 'success' | 'attention'; text: string }

async function askArea(name: string): Promise<Answer> {
  const response = await fetch(urlFor('area.check', {}, { qs: { q: name } }), {
    headers: { Accept: 'application/json' },
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
    return { tone: 'attention', text: 'Kecamatan tidak ditemukan. Periksa ejaannya.' }
  }
  return area.isCovered
    ? { tone: 'success', text: `${area.name} terjangkau.` }
    : { tone: 'attention', text: `${area.name} belum terjangkau.` }
}

// GUEST-1: a guest types a kecamatan and reads one line back (D100).
export default function AreaCheckForm() {
  const [name, setName] = useState('')
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault()
    setIsChecking(true)
    try {
      setAnswer(await askArea(name))
    } catch {
      setAnswer({
        tone: 'attention',
        text: 'Pengecekan gagal. Periksa koneksi Anda lalu coba lagi.',
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <form id="cek-area" onSubmit={handleSubmit} className="flex max-w-md flex-col gap-2">
      <Field>
        <FieldLabel htmlFor="area-name">Cek area layanan</FieldLabel>
        <div className="flex gap-2">
          <Input
            id="area-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nama kecamatan, mis. Coblong"
            autoComplete="off"
            minLength={3}
            maxLength={60}
            required
            className="h-11"
          />
          <Button
            type="submit"
            variant="outline"
            isDisabled={isChecking}
            className="h-11 px-5 text-base"
          >
            Cek
          </Button>
        </div>
      </Field>
      <div role="status" aria-live="polite">
        {answer && <Note tone={answer.tone}>{answer.text}</Note>}
      </div>
    </form>
  )
}
