import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconHelpCircleFilled,
  IconLoader2,
} from '@tabler/icons-react'
import { cn } from 'cn'
import Note from '~/components/atoms/note'
import type { PinCheck } from '~/lib/map/pin_check'

const ICONS = {
  checking: IconLoader2,
  attention: IconHelpCircleFilled,
  success: IconCircleCheckFilled,
  danger: IconCircleXFilled,
}

// The one line under a pin map (AREA-4): "Masuk area layanan." or "Di luar area layanan…", read out
// when it changes.
export default function CoverageStatus({ check }: { check: PinCheck }) {
  const Icon = ICONS[check.tone]
  return (
    <div role="status" aria-live="polite">
      <Note
        tone={check.tone === 'checking' ? 'info' : check.tone}
        variant="plain"
        icon={
          <Icon
            aria-hidden="true"
            className={cn('mt-px size-4.5 shrink-0', check.tone === 'checking' && 'animate-spin')}
          />
        }
      >
        {check.text}
      </Note>
    </div>
  )
}
