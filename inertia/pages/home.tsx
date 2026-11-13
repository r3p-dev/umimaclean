import type { ReactNode } from 'react'
import PhotoCredit from '~/components/molecules/photo_credit'
import SeoHead from '~/components/molecules/seo_head'
import FaqSection from '~/components/organisms/landing/faq_section'
import Hero from '~/components/organisms/landing/hero'
import HowItWorks from '~/components/organisms/landing/how_it_works'
import LaundryItems from '~/components/organisms/landing/laundry_items'
import ReviewsSection from '~/components/organisms/landing/reviews_section'
import PublicLayout from '~/components/templates/public_layout'

// The price list and the service area check join this page in M3 (GUEST-1).
export default function Home() {
  return (
    <>
      <SeoHead
        title="Cuci sepatu, tas, dan helm di Bandung Raya"
        description="Cuci sepatu dan tas dengan antar-jemput gratis di Kota Bandung, Kota Cimahi, dan sebagian Kabupaten Bandung. Helm dicuci langsung di toko."
      />
      <Hero />
      <LaundryItems />
      <HowItWorks />
      <ReviewsSection />
      <FaqSection />
    </>
  )
}

Home.layout = (page: ReactNode) => <PublicLayout footerNote={<PhotoCredit />}>{page}</PublicLayout>
