import Breadcrumbs from '~/components/breadcrumbs'
import { publicLayout } from '~/layouts/public'
import { SITE } from '@content/business'
import { FAQS, TERMS } from '@content/site'

export default function Faq() {
  return (
    <>
      <Breadcrumbs trail={[{ name: 'FAQ', url: '/faq' }]} />

      <div className="mx-auto max-w-3xl px-5 pt-8 pb-14">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">
          Pertanyaan yang sering masuk
        </h1>

        <p className="mt-5 text-lg text-ink-body">
          Kalau pertanyaan Anda tidak ada di sini, tanyakan lewat WhatsApp di{' '}
          <a className="underline hover:no-underline" href={SITE.whatsapp}>
            {SITE.telephoneDisplay}
          </a>
          . Untuk memesan, gunakan{' '}
          <a className="underline hover:no-underline" href="/pesan">
            formulir pemesanan
          </a>
          .
        </p>

        <dl className="mt-10 divide-y divide-line border-t border-line">
          {FAQS.map((faq) => (
            <div key={faq.question} className="py-6">
              <dt className="text-base font-semibold text-ink">{faq.question}</dt>
              <dd className="mt-2 text-ink-body">{faq.answer}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-14" aria-labelledby="ketentuan">
          <h2 id="ketentuan" className="text-2xl font-semibold text-ink">
            Ketentuan layanan
          </h2>
          <ol className="mt-6 space-y-4">
            {TERMS.map((term, index) => (
              <li key={term} className="flex gap-4 text-ink-body">
                <span className="font-medium text-ink-muted">{index + 1}.</span>
                <span>{term}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  )
}

Faq.layout = publicLayout
