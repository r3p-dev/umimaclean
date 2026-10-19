import { type ReactNode } from 'react'
import { cn } from 'cn'
import {
  DisclosurePanel as AccordionContentPrimitive,
  Heading as AccordionHeaderPrimitive,
  Disclosure as AccordionItemPrimitive,
  DisclosureGroup as AccordionPrimitive,
  Button as AccordionTriggerPrimitive,
  type ButtonProps,
  type DisclosureGroupProps,
  type DisclosurePanelProps,
  type DisclosureProps,
} from 'react-aria-components'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'

function Accordion({ className, ...props }: DisclosureGroupProps) {
  return (
    <AccordionPrimitive
      data-slot="accordion"
      className={cn('flex w-full flex-col', className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: DisclosureProps) {
  return (
    <AccordionItemPrimitive
      data-slot="accordion-item"
      className={cn('border-b', className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  level = 3,
  ...props
}: Omit<ButtonProps, 'children'> & { children: ReactNode; level?: number }) {
  return (
    <AccordionHeaderPrimitive level={level} className="flex">
      <AccordionTriggerPrimitive
        slot="trigger"
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 py-3.5 text-left text-base leading-[1.4] font-semibold text-foreground transition-all disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
        <IconChevronDown
          data-slot="accordion-trigger-icon"
          className="pointer-events-none size-6 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:hidden"
        />
        <IconChevronUp
          data-slot="accordion-trigger-icon"
          className="pointer-events-none hidden size-6 shrink-0 text-muted-foreground group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionTriggerPrimitive>
    </AccordionHeaderPrimitive>
  )
}

function AccordionContent({ className, children, ...props }: DisclosurePanelProps) {
  return (
    <AccordionContentPrimitive
      data-slot="accordion-content"
      className="overflow-clip text-sm transition-[height] data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          'pb-4 pr-10 text-md leading-[1.6] text-pretty text-foreground-secondary',
          className
        )}
      >
        {children}
      </div>
    </AccordionContentPrimitive>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
