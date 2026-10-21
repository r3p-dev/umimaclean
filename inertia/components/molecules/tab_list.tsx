import { useRef, type KeyboardEvent } from 'react'
import { cn } from '~/lib/shared/utils'

export default function TabList<T extends string>({
  label,
  tabs,
  value,
  onChange,
  idPrefix,
  panelId,
  className,
  tabClassName,
}: {
  label: string
  tabs: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  idPrefix: string
  panelId: string
  className?: string
  tabClassName?: string
}) {
  const list = useRef<HTMLDivElement>(null)

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.value === value)
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft'
          ? (index - 1 + tabs.length) % tabs.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabs.length - 1
              : -1
    if (next < 0) {
      return
    }
    event.preventDefault()
    onChange(tabs[next].value)
    list.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div
      ref={list}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn(
        'flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:none]',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            id={`${idPrefix}-${tab.value}`}
            aria-selected={isActive}
            aria-controls={panelId}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={cn(
              '-mb-px h-btn-desktop shrink-0 rounded-t-md border-b-2 px-3 text-sm leading-none whitespace-nowrap hover:bg-accent',
              isActive
                ? 'border-primary font-semibold text-foreground'
                : 'border-transparent font-medium text-foreground-secondary',
              tabClassName
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
