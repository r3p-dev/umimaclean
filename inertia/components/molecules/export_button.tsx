import { useState } from 'react'
import { toast } from 'sonner'
import { IconDownload, IconLoader2 } from '@tabler/icons-react'
import { Button } from '~/components/ui/button'
import { exportWorkbook, type ExportSpec } from '~/lib/export/excel'
import { cn } from '~/lib/shared/utils'

export default function ExportButton({
  build,
  ariaLabel,
  selectedCount = 0,
  size = 'desktop',
  className,
}: {
  build: () => ExportSpec
  ariaLabel: string
  selectedCount?: number
  size?: 'desktop' | 'compact'
  className?: string
}) {
  const [isBusy, setBusy] = useState(false)

  async function run() {
    if (isBusy) {
      return
    }
    setBusy(true)
    const result = await exportWorkbook(build)
    setBusy(false)
    if (result.status === 'saved') {
      toast.success(result.message)
    } else if (result.status === 'empty') {
      toast.info(result.message)
    } else {
      toast.error(result.message, { duration: 6000 })
    }
  }

  return (
    <Button
      variant="outline"
      size={size}
      onPress={run}
      isDisabled={isBusy}
      aria-busy={isBusy}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn('gap-1.5 px-3.5 text-sm', className)}
    >
      {isBusy ? (
        <IconLoader2 className="size-4.5 animate-spin" />
      ) : (
        <IconDownload className="size-4.5" />
      )}
      {isBusy ? 'Menyiapkan…' : 'Unduh Excel'}
      {selectedCount > 0 && (
        <span
          aria-hidden="true"
          className="h-5.5 min-w-5.5 rounded-pill bg-primary px-1.5 text-center text-xs leading-5.5 font-bold text-primary-foreground"
        >
          {selectedCount}
        </span>
      )}
    </Button>
  )
}
