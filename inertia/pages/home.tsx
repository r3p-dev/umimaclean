import { Head } from '@inertiajs/react'
import CustomerLayout from '~/components/templates/customer_layout'
import FaqSection from '~/components/organisms/landing/faq_section'
import Hero from '~/components/organisms/landing/hero'
import HowItWorks from '~/components/organisms/landing/how_it_works'
import LaundryItems from '~/components/organisms/landing/laundry_items'
import PriceListSection from '~/components/organisms/landing/price_list_section'
import ReviewsSection from '~/components/organisms/landing/reviews_section'
import ServiceAreaSection from '~/components/organisms/landing/service_area_section'

export default function Home() {
  return (
    <>
      <Head title="Beranda" />
      <Hero />
      <LaundryItems />
      <HowItWorks />
      <ReviewsSection />
      <PriceListSection />
      <FaqSection />
      <ServiceAreaSection />
    </>
  )
}

Home.layout = [CustomerLayout]
