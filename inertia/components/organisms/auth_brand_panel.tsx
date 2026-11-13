import type { ComponentType, SVGProps } from 'react'
import { Link } from '@adonisjs/inertia/react'
import {
  IconClipboardCheck,
  IconMessage,
  IconReceipt,
  IconRoute,
  IconTruckDelivery,
  IconWashMachine,
} from '@tabler/icons-react'
import Logo from '~/components/atoms/logo'
import { STORE_CONTACT } from '~/lib/store/contact'

type Benefit = { icon: ComponentType<SVGProps<SVGSVGElement>>; title: string; text: string }

const CUSTOMER: { headline: string; benefits: Benefit[] } = {
  headline: 'Sepatu dan tas bersih tanpa keluar rumah.',
  benefits: [
    {
      icon: IconTruckDelivery,
      title: 'Jemput & antar gratis',
      text: 'Kota Bandung, Cimahi, dan sebagian Kab. Bandung.',
    },
    {
      icon: IconClipboardCheck,
      title: 'Tidak perlu memilih layanan',
      text: 'Tim kami memeriksa barang lalu menentukan layanan dan harga.',
    },
    {
      icon: IconReceipt,
      title: 'Riwayat & alamat tersimpan',
      text: 'Pesan lagi tanpa mengisi data dari awal.',
    },
  ],
}

const STAFF: typeof CUSTOMER = {
  headline: 'Aplikasi staf dan dasbor owner Umima Clean.',
  benefits: [
    {
      icon: IconRoute,
      title: 'Jemput & antar',
      text: 'Antrean tugas, rute, dan foto bukti dalam satu tempat.',
    },
    {
      icon: IconWashMachine,
      title: 'Proses di workshop',
      text: 'Periksa barang, tentukan layanan, dan pantau pencucian.',
    },
    {
      icon: IconReceipt,
      title: 'Ringkasan bisnis',
      text: 'Owner memantau pesanan, omzet, dan aktivitas staf.',
    },
  ],
}

export default function AuthBrandPanel({ isStaff = false }: { isStaff?: boolean }) {
  const content = isStaff ? STAFF : CUSTOMER

  return (
    <aside className="sticky top-0 hidden h-dvh flex-col justify-between bg-foreground px-16 py-12 text-background lg:flex">
      <Link route="home" className="self-start rounded-sm">
        <Logo />
      </Link>
      <div className="flex max-w-xl flex-col gap-9">
        <p className="text-5xl leading-none font-bold tracking-tight">{content.headline}</p>
        <ul className="flex flex-col gap-7">
          {content.benefits.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-card text-foreground">
                <Icon className="size-5" />
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-lg leading-snug font-semibold">{title}</span>
                <span className="text-base text-background/70">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <a
        href={STORE_CONTACT.whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center gap-2 self-start text-sm text-background/70 hover:text-background"
      >
        <IconMessage className="size-4.5" />
        Butuh bantuan? Chat WhatsApp Umima Clean.
      </a>
    </aside>
  )
}
