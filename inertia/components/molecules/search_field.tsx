import { IconSearch } from '@tabler/icons-react'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/shared/utils'

export default function SearchField({
  label,
  placeholder,
  value,
  onChange,
  className,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={cn('relative min-w-0 flex-[1_1_280px]', className)}>
      <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-icon-muted" />
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pr-3 pl-10"
      />
    </div>
  )
}
