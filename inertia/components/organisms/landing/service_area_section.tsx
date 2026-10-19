import { useState } from 'react'
import {
  IconArrowRight,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconHelpCircleFilled,
  IconInfoCircle,
  IconSearch,
} from '@tabler/icons-react'
import { urlFor } from '~/client'
import { Badge } from '~/components/ui/badge'
import { LinkButton } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '~/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group'
import {
  AREA_QUERY_MAX,
  checkServiceArea,
  SERVICE_REGIONS,
  type AreaTone,
} from '~/lib/location/service_area'
import { cn } from '~/lib/shared/utils'

const TONES: Record<AreaTone, { border: string; text: string; Icon: typeof IconInfoCircle }> = {
  idle: { border: 'border-input', text: 'text-muted-foreground', Icon: IconInfoCircle },
  covered: {
    border: 'border-success-border',
    text: 'text-success-foreground',
    Icon: IconCircleCheckFilled,
  },
  outside: {
    border: 'border-destructive-border',
    text: 'text-destructive-text',
    Icon: IconCircleXFilled,
  },
  unknown: {
    border: 'border-attention-border',
    text: 'text-attention-foreground',
    Icon: IconHelpCircleFilled,
  },
}

export default function ServiceAreaSection() {
  const [query, setQuery] = useState('')
  const result = checkServiceArea(query)
  const tone = TONES[result.tone]

  return (
    <section
      id="area-layanan"
      className="mx-auto box-content grid max-w-page items-end gap-6 px-5 pt-8 pb-7 sm:grid-cols-2"
    >
      <div className="flex flex-col gap-3.5">
        <h2 className="text-title">Area layanan</h2>
        <ul className="flex flex-wrap gap-2">
          {SERVICE_REGIONS.map((region) => (
            <li key={region}>
              <Badge variant="outline" size="chip">
                {region}
              </Badge>
            </li>
          ))}
        </ul>

        <Field className="mt-1">
          <FieldLabel htmlFor="area-query">Cek area layanan</FieldLabel>

          <InputGroup className={cn('h-input border-[1.5px]', tone.border)}>
            <InputGroupInput
              id="area-query"
              type="text"
              autoComplete="off"
              placeholder="Ketik kecamatan, mis. Coblong"
              maxLength={AREA_QUERY_MAX}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-describedby="area-result"
            />

            <InputGroupAddon>
              <IconSearch />
            </InputGroupAddon>
          </InputGroup>

          <FieldDescription
            id="area-result"
            role="status"
            aria-live="polite"
            className={cn('flex items-start gap-1.5 text-note font-medium text-pretty', tone.text)}
          >
            <tone.Icon className="mt-px size-4.5 shrink-0" />
            <span>{result.message}</span>
          </FieldDescription>
        </Field>
      </div>

      <Card className="gap-2.5 border-0 bg-background">
        <CardHeader>
          <CardTitle className="text-base leading-[1.3]">Siap dijemput?</CardTitle>
        </CardHeader>

        <CardContent>
          <LinkButton
            size="cta"
            className="sm:w-auto sm:min-w-74 sm:px-7"
            href={urlFor('order.details')}
          >
            Pesan Penjemputan
            <IconArrowRight />
          </LinkButton>
        </CardContent>
      </Card>
    </section>
  )
}
