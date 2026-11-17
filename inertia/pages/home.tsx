import type { ReactNode } from 'react'
import PhotoCredit from '~/components/molecules/photo_credit'
import SeoHead from '~/components/molecules/seo_head'
import CoverageSection from '~/components/organisms/landing/coverage_section'
import FaqSection from '~/components/organisms/landing/faq_section'
import Hero from '~/components/organisms/landing/hero'
import HowItWorks from '~/components/organisms/landing/how_it_works'
import LaundryItems from '~/components/organisms/landing/laundry_items'
import PricingSection, { type PricingService } from '~/components/organisms/landing/pricing_section'
import ReviewsSection from '~/components/organisms/landing/reviews_section'
import PublicLayout from '~/components/templates/public_layout'
import type { Data } from '@generated/data'

export default function Home({
  services = [],
  areaShapes,
  tilesUrl,
}: {
  services: PricingService[]
  areaShapes?: Data.ServiceAreaShape[]
  tilesUrl: string | null
}) {
  return (
    <>
      <SeoHead
        title="Cuci sepatu, tas, dan helm di Bandung Raya"
        description="Cuci sepatu dan tas dengan antar-jemput gratis di Kota Bandung, Kota Cimahi, dan sebagian Kabupaten Bandung. Helm dicuci langsung di toko."
      />
      <Hero />
      <PricingSection services={services} />
      <LaundryItems />
      <HowItWorks />
      <ReviewsSection />
      <CoverageSection areaShapes={areaShapes} tilesUrl={tilesUrl} />
      <FaqSection />
    </>
  )
}

Home.layout = (page: ReactNode) => <PublicLayout footerNote={<PhotoCredit />}>{page}</PublicLayout>
