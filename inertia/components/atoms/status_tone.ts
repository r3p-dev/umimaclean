import type { StatusTone } from '~/lib/tracking/status'

export const TONE_CLASSES: Record<
  StatusTone,
  { surface: string; ink: string; dot: string; ring: string; halo: string }
> = {
  jemput: {
    surface: 'bg-status-jemput-bg',
    ink: 'text-status-jemput-fg',
    dot: 'bg-status-jemput-dot',
    ring: 'border-status-jemput-dot',
    halo: 'shadow-[0_0_0_5px_var(--status-jemput-bg)]',
  },
  periksa: {
    surface: 'bg-status-periksa-bg',
    ink: 'text-status-periksa-fg',
    dot: 'bg-status-periksa-dot',
    ring: 'border-status-periksa-dot',
    halo: 'shadow-[0_0_0_5px_var(--status-periksa-bg)]',
  },
  bayar: {
    surface: 'bg-status-bayar-bg',
    ink: 'text-status-bayar-fg',
    dot: 'bg-status-bayar-dot',
    ring: 'border-status-bayar-dot',
    halo: 'shadow-[0_0_0_5px_var(--status-bayar-bg)]',
  },
  cuci: {
    surface: 'bg-status-cuci-bg',
    ink: 'text-status-cuci-fg',
    dot: 'bg-status-cuci-dot',
    ring: 'border-status-cuci-dot',
    halo: 'shadow-[0_0_0_5px_var(--status-cuci-bg)]',
  },
  antar: {
    surface: 'bg-status-antar-bg',
    ink: 'text-status-antar-fg',
    dot: 'bg-status-antar-dot',
    ring: 'border-status-antar-dot',
    halo: 'shadow-[0_0_0_5px_var(--status-antar-bg)]',
  },
  selesai: {
    surface: 'bg-status-selesai-bg',
    ink: 'text-status-selesai-fg',
    dot: 'bg-status-selesai-dot',
    ring: 'border-status-selesai-dot',
    halo: 'shadow-[0_0_0_5px_var(--status-selesai-bg)]',
  },
  batal: {
    surface: 'bg-status-batal-bg',
    ink: 'text-status-batal-fg',
    dot: 'bg-status-batal-dot',
    ring: 'border-status-batal-dot',
    halo: 'shadow-[0_0_0_5px_var(--status-batal-bg)]',
  },
}
