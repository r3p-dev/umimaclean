import type { ReactNode } from 'react'
import { IconArrowRight } from '@tabler/icons-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { STORE_CONTACT } from '~/lib/store/contact'

const QUESTIONS: { question: string; answer: ReactNode }[] = [
  {
    question: 'Bagaimana cara memesan layanan Umima Clean?',
    answer:
      'Daftar akun di situs ini, lalu pesan penjemputan. Anda juga bisa menghubungi kami via WhatsApp atau datang langsung ke workshop kami.',
  },
  {
    question: 'Berapa harga layanan cuci sepatu?',
    answer:
      'Harga tergantung jenis barang dan layanan yang dibutuhkan. Harga akhir ditentukan setelah barang diperiksa dan dikirim lewat tagihan via WhatsApp.',
  },
  {
    question: 'Berapa lama proses pencuciannya?',
    answer:
      'Tergantung jenis sepatu dan layanan yang dibutuhkan. Rata-rata 2–4 hari kerja, dan bisa lebih cepat dengan One Day Service.',
  },
  {
    question: 'Sepatu apa saja yang bisa dicuci?',
    answer:
      'Kami menerima berbagai jenis sepatu, termasuk sneakers, kulit, suede, kanvas, boots, dan lainnya.',
  },
  {
    question: 'Apakah bisa mencuci sepatu berbahan suede atau kulit?',
    answer:
      'Tentu. Untuk sepatu suede tersedia Premium for Suede, yang membuat suede lebih lembut dengan warna yang lebih tajam.',
  },
  {
    question: 'Apakah Umima Clean menyediakan antar-jemput?',
    answer:
      'Ya, gratis untuk alamat di area layanan kami: Kota Bandung, Kota Cimahi, dan sebagian Kabupaten Bandung. Helm dicuci langsung di toko.',
  },
  {
    question: 'Apakah tersedia layanan repaint?',
    answer:
      'Ya. Kami menawarkan Premium Repaint dan Midsole Repaint / Recolour agar sepatu Anda kembali segar seperti baru.',
  },
  {
    question: 'Apakah ada garansi?',
    answer:
      'Ya. Jika hasil kurang maksimal, Anda bisa mengajukan pencucian ulang. Untuk kerusakan, klaim garansi dengan menunjukkan foto kondisi sepatu sehari sebelum treatment.',
  },
  {
    question: 'Di mana lokasi Umima Clean?',
    answer: (
      <>
        Workshop kami ada di {STORE_CONTACT.address}.{' '}
        <a
          href={STORE_CONTACT.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Lihat lokasinya di Google Maps
        </a>
        , atau hubungi kami via WhatsApp untuk info lebih lanjut.
      </>
    ),
  },
]

export default function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="mx-auto grid max-w-6xl scroll-mt-4 items-start gap-4 px-5 pt-12 pb-12 lg:grid-cols-3 lg:gap-x-10"
    >
      <div className="flex flex-col items-start gap-2 lg:sticky lg:top-6">
        <h2 id="faq-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
          Pertanyaan umum
        </h2>
        <p className="text-base text-foreground/80">
          Masih ragu? Ini jawaban dari pertanyaan yang sering ditanyakan.
        </p>
        <a
          href={STORE_CONTACT.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Tanya lewat WhatsApp
          <IconArrowRight className="size-4.5" />
        </a>
      </div>
      <Accordion defaultExpandedKeys={['0']} className="lg:col-span-2">
        {QUESTIONS.map((item, index) => (
          <AccordionItem key={item.question} id={String(index)}>
            <AccordionTrigger className="min-h-11 text-base">{item.question}</AccordionTrigger>
            <AccordionContent className="text-base text-foreground/80">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
