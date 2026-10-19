import { IconCash, IconClipboardCheck, IconClock, IconMapPinPin } from '@tabler/icons-react'

const TERMS = [
  {
    Icon: IconMapPinPin,
    title: 'Isi detail lokasi',
    description:
      'Pelanggan wajib mengisi formulir pesanan dengan detail lokasi agar tim penjemput mudah menemukan titik penjemputan.',
  },
  {
    Icon: IconClock,
    title: 'Waktu mengikuti rute',
    description:
      'Waktu penjemputan disesuaikan dengan rute antar-jemput hari itu. Bila tidak bisa bertemu langsung dengan tim penjemput, barang dapat dititipkan dan dikonfirmasi kepada tim yang menghubungi Anda atau melalui admin.',
  },
  {
    Icon: IconClipboardCheck,
    title: 'Layanan sesuai kondisi',
    description:
      'Layanan disesuaikan dengan jenis dan tingkat kekotoran barang. Bila ada tambahan layanan, konfirmasikan paling lambat saat tagihan dikirim.',
  },
  {
    Icon: IconCash,
    title: 'Diproses setelah bayar',
    description: 'Barang diproses setelah pembayaran diterima.',
  },
]

export default function PickupTerms() {
  return (
    <section
      id="ketentuan"
      aria-labelledby="ketentuan-heading"
      className="mx-auto box-content flex max-w-page flex-col gap-4 px-5 pt-10 pb-2"
    >
      <h2 id="ketentuan-heading" className="text-title">
        Ketentuan antar-jemput
      </h2>
      <ol className="grid gap-x-8 gap-y-4.5 sm:grid-cols-2">
        {TERMS.map(({ Icon, title, description }) => (
          <li key={title} className="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3.5">
            <span className="flex size-10 items-center justify-center rounded-md bg-background text-foreground-secondary">
              <Icon className="size-5.5" />
            </span>
            <div>
              <h3 className="text-[15.5px] leading-[1.3] font-semibold">{title}</h3>
              <p className="mt-0.75 text-sm leading-normal text-pretty text-foreground-secondary">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
