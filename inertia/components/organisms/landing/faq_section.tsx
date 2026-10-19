import { useState } from 'react'
import { IconArrowRight, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { customerContact, customerLinks } from '~/lib/navigation/customer_links'
import { cn } from '~/lib/shared/utils'

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
        <a
          href={customerLinks.maps}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-primary hover:text-primary-hover hover:underline"
        >
          Lihat lokasinya di Google Maps
        </a>
        , atau hubungi kami via WhatsApp untuk info lebih lanjut.
      </>
    ),
  },
]

export default function FaqSection() {
  const [open, setOpen] = useState<number>(0)

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

        <a
          href={customerLinks.whatsapp}
          target="_blank"
          rel="noreferrer"
          className="hit-area mt-1 inline-flex items-center gap-1 text-sm leading-[1.4] font-semibold text-primary hover:text-primary-hover hover:underline"
        >
          Tanya lewat WhatsApp
          <IconArrowRight className="size-4.5 shrink-0" />
        </a>
      </div>

      <div className="w-full">
        {QUESTIONS.map((item, index) => {
          const expanded = open === index
          const Icon = expanded ? IconChevronUp : IconChevronDown
          return (
            <div
              key={item.question}
              className={cn('border-t border-border', index === QUESTIONS.length - 1 && 'border-b')}
            >
              <h3>
                <button
                  type="button"
                  id={`faq-q-${index}`}
                  aria-expanded={expanded}
                  aria-controls={`faq-a-${index}`}
                  onClick={() => setOpen(expanded ? -1 : index)}
                  className="flex min-h-14 w-full items-center justify-between gap-4 py-3.5 text-left text-base leading-[1.4] font-semibold text-foreground"
                >
                  {item.question}
                  <Icon className="size-6 shrink-0 text-muted-foreground" />
                </button>
              </h3>

              <p
                id={`faq-a-${index}`}
                role="region"
                aria-labelledby={`faq-q-${index}`}
                hidden={!expanded}
                className="mb-4 pr-10 text-md leading-[1.6] text-pretty text-foreground-secondary"
              >
                {item.answer}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
