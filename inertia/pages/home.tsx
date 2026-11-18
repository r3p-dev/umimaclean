import type { ReactNode } from 'react'
import PhotoCredit from '~/components/molecules/photo_credit'
import SeoHead from '~/components/molecules/seo_head'
import FaqSection from '~/components/organisms/landing/faq_section'
import Hero from '~/components/organisms/landing/hero'
import HowItWorks from '~/components/organisms/landing/how_it_works'
import LaundryItems from '~/components/organisms/landing/laundry_items'
import PricingSection, { type PricingService } from '~/components/organisms/landing/pricing_section'
import ReviewsSection from '~/components/organisms/landing/reviews_section'
import PublicLayout from '~/components/templates/public_layout'

export default function Home({ services = [] }: { services: PricingService[] }) {
  return (
    <>
      <SeoHead
        title="Cuci sepatu, tas, dan helm di Bandung Raya"
        description="Cuci sepatu dan tas dengan antar-jemput gratis di Kota Bandung, Kota Cimahi, dan sebagian Kabupaten Bandung. Helm dicuci langsung di toko."
      />
      <Hero />
      <LaundryItems />
      <HowItWorks />
      <PricingSection services={services} />
      <ReviewsSection />
      <FaqSection />
    </>
  )
}

Home.layout = (page: ReactNode) => <PublicLayout footerNote={<PhotoCredit />}>{page}</PublicLayout>
