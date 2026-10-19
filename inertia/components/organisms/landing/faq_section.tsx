import { IconArrowRight } from '@tabler/icons-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { LinkButton } from '~/components/ui/button'
import { customerContact, customerLinks } from '~/lib/navigation/customer_links'

const QUESTIONS = [
  {
    question: 'Bagaimana cara memesan layanan Umima Clean?',
    answer:
      'Pesan penjemputan langsung di situs ini, hubungi kami via WhatsApp atau DM, atau datang ke workshop kami.',
  },
  {
    question: 'Berapa harga layanan cuci sepatu?',
    answer:
      'Harga bervariasi, tergantung jenis sepatu dan layanan yang dibutuhkan. Lihat Daftar harga di atas; harga akhir ditentukan setelah barang diperiksa dan dikirim lewat tagihan via WhatsApp.',
  },
  {
    question: 'Berapa lama proses pencuciannya?',
    answer:
      'Tergantung jenis sepatu dan layanan yang dibutuhkan. Rata-rata 2-4 hari kerja, dan bisa lebih cepat dengan One Day Service.',
  },
  {
    question: 'Sepatu apa saja yang bisa dicuci?',
    answer:
      'Kami menerima berbagai jenis sepatu, termasuk sneakers, kulit, suede, kanvas, boots, dan lainnya.',
  },
  {
    question: 'Apakah bisa mencuci sepatu berbahan suede atau kulit?',
    answer:
      'Tentu. Kami menyediakan layanan premium untuk perawatan ekstra sepatu berbahan kulit, termasuk Mirror Shine Treatment. Untuk sepatu suede tersedia Premium for Suede, yang membuat suede lebih lembut dengan warna yang lebih tajam.',
  },
  {
    question: 'Apakah Umima Clean menyediakan antar-jemput?',
    answer: 'Ya. Kami menyediakan layanan antar-jemput agar lebih praktis untuk Anda.',
  },
  {
    question: 'Apakah bisa mencuci lebih dari satu pasang sekaligus?',
    answer: 'Tentu. Kami punya diskon khusus untuk cuci banyak pasang.',
  },
  {
    question: 'Apakah tersedia layanan repair atau repaint?',
    answer:
      'Ya. Kami juga menawarkan layanan repaint dan minor repair agar sepatu Anda kembali segar seperti baru.',
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
        Workshop kami ada di {customerContact.address}.{' '}
        <LinkButton
          variant="link"
          href={customerLinks.maps}
          target="_blank"
          rel="noreferrer"
          className="inline h-auto min-h-0 p-0 font-semibold text-primary hover:text-primary-hover hover:underline"
        >
          Lihat lokasinya di Google Maps
        </LinkButton>
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
      className="mx-auto box-content grid max-w-page items-start gap-4 px-5 pt-10 pb-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-x-10"
    >
      <div className="flex flex-col items-start gap-2 lg:sticky lg:top-6">
        <h2 id="faq-heading" className="text-title">
          Pertanyaan umum
        </h2>

        <p className="max-w-160 text-md leading-[1.55] text-pretty text-foreground-secondary">
          Masih ragu? Ini jawaban dari pertanyaan yang sering ditanyakan.
        </p>

        <LinkButton
          variant="link"
          href={customerLinks.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="hit-area mt-1 inline-flex items-center gap-1 self-start text-sm leading-[1.4] font-semibold text-primary hover:text-primary-hover hover:underline"
        >
          Tanya lewat WhatsApp
          <IconArrowRight className="size-4.5 shrink-0" />
        </LinkButton>
      </div>

      <Accordion defaultExpandedKeys={['0']} className="w-full">
        {QUESTIONS.map((item, index) => (
          <AccordionItem key={item.question} id={String(index)}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
