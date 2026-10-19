import { useId, useState, type KeyboardEvent, type Ref } from 'react'
import { IconLoader2, IconMapPin, IconNavigation } from '@tabler/icons-react'
import Overline from '~/components/atoms/overline'
import { Textarea } from '~/components/ui/textarea'
import type { AddressSuggestion, OriginState, SuggestionMode } from '~/lib/location/suggest'
import { cn } from '~/lib/shared/utils'

export type AddressSuggestions = {
  mode: SuggestionMode | null
  items: AddressSuggestion[]
  loading: boolean
  failed: boolean
  origin: OriginState
}

function statusText({ mode, items, loading, failed, origin }: AddressSuggestions) {
  if (mode === null) {
    if (origin === 'locating') return 'Membaca lokasi Anda…'
    if (origin === 'denied')
      return 'Lokasi tidak bisa dibaca. Ketik nama jalan untuk melihat saran alamat.'
    return null
  }
  if (loading && !items.length)
    return mode === 'nearby' ? 'Mencari alamat di sekitar Anda…' : 'Mencari alamat…'
  if (failed) return 'Saran alamat tidak bisa dimuat. Ketik alamat lengkap Anda.'
  if (!items.length) return 'Tidak ada saran. Lanjutkan mengetik alamat lengkap Anda.'
  return null
}

export default function AddressCombobox({
  id,
  inputRef,
  value,
  suggestions,
  invalid,
  describedBy,
  onChange,
  onPick,
  onFocus,
  onBlur,
}: {
  id: string
  inputRef?: Ref<HTMLTextAreaElement>
  value: string
  suggestions: AddressSuggestions
  invalid?: boolean
  describedBy?: string
  onChange: (value: string) => void
  onPick: (suggestion: AddressSuggestion) => void
  onFocus?: () => void
  onBlur?: () => void
}) {
  const listId = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const { mode, items, loading } = suggestions
  const status = statusText(suggestions)
  const expanded = open && (items.length > 0 || !!status)
  const activeItem = expanded ? items[active] : undefined
  const Icon = mode === 'nearby' ? IconNavigation : IconMapPin

  function pick(suggestion: AddressSuggestion) {
    onPick(suggestion)
    setOpen(false)
    setActive(-1)
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      if (!items.length) return
      const last = items.length - 1
      setActive((current) =>
        event.key === 'ArrowDown'
          ? current >= last
            ? 0
            : current + 1
          : current <= 0
            ? last
            : current - 1
      )
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (activeItem) pick(activeItem)
      else event.currentTarget.form?.requestSubmit()
      return
    }
    if (event.key === 'Escape' && open) {
      event.preventDefault()
      setOpen(false)
      setActive(-1)
    }
  }

  return (
    <div className="relative">
      <Textarea
        ref={inputRef}
        id={id}
        rows={3}
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={activeItem ? `${listId}-${active}` : undefined}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        value={value}
        onChange={(event) => {
          onChange(event.target.value.replace(/\s*\n\s*/g, ', ').slice(0, 240))
          setOpen(true)
          setActive(-1)
        }}
        onFocus={() => {
          setOpen(true)
          onFocus?.()
        }}
        onBlur={() => {
          setOpen(false)
          setActive(-1)
          onBlur?.()
        }}
        onKeyDown={onKeyDown}
        className="p-3.5"
      />
      <div
        className={cn(
          'absolute inset-x-0 top-full z-30 mt-1.5 rounded-lg border border-border bg-card p-1.5 shadow-1',
          !expanded && 'hidden'
        )}
      >
        {items.length > 0 && (
          <Overline as="p" className="flex items-center gap-2 px-2.5 pt-2 pb-1.5 text-xs">
            {mode === 'nearby' ? 'Di sekitar Anda' : 'Saran alamat'}
            {loading && <IconLoader2 className="size-3.5 animate-spin" />}
          </Overline>
        )}
        <ul id={listId} role="listbox" aria-label="Saran alamat">
          {items.map((item, index) => (
            <li
              key={item.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => setActive(index)}
              onClick={() => pick(item)}
              className="flex min-h-icon-btn cursor-pointer items-start gap-2.5 rounded-inner px-2.5 py-2 aria-selected:bg-accent"
            >
              <Icon className="my-px size-4.5 shrink-0 text-icon-muted" />
              <span className="min-w-0">
                <span className="block text-[15px] leading-[1.3] font-medium">{item.title}</span>
                {item.detail && (
                  <span className="block text-meta leading-[1.4] text-muted-foreground">
                    {item.detail}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        {status && (
          <p className="flex items-start gap-2 px-2.5 py-2.5 text-meta leading-[1.45] text-muted-foreground">
            {(loading || suggestions.origin === 'locating') && (
              <IconLoader2 className="my-px size-4 shrink-0 animate-spin" />
            )}
            {status}
          </p>
        )}
      </div>
      <p role="status" className="sr-only">
        {expanded && items.length
          ? `${items.length} saran alamat${mode === 'nearby' ? ' di sekitar Anda' : ''}`
          : ''}
      </p>
    </div>
  )
}
