import type { HttpContext } from '@adonisjs/core/http'

import { withSeo } from '#seo/render'
import { canonical } from '#seo/urls'
import { SITE } from '#seo/config'
import { FAQS } from '#content/site'
import { AREAS, findArea, COVERED_KECAMATAN } from '#content/areas'
import { SERVICES, findService, priceFrom, rupiah } from '#content/services'
import { webPage, breadcrumbList, service, faqPage, itemList, offersFrom } from '#seo/schema'

/**
 * Every public page.
 *
 * Each action reads the same way: describe the page, build the JSON-LD nodes
 * that belong to it, hand both to Inertia. The site-level nodes — the business,
 * the website, the free-pickup offer — are added by `withSeo`, so an action
 * only ever declares what is specific to its own page.
 */
export default class PublicController {
  async home({ inertia }: HttpContext) {
    /** Describe the page for search results */
    const url = canonical('/')
    const seo = {
      path: '/',
      title: 'Cuci Sepatu, Tas & Helm Bandung — Antar Jemput Gratis',
      description: SITE.description,
      jsonLd: [
        webPage({
          canonical: url,
          name: 'Umima.clean — cuci & reparasi sepatu, tas, dan helm di Bandung',
          description: SITE.description,
        }),
      ],
    }

    return inertia.render('public/home', {}, withSeo(seo))
  }

  async services({ inertia }: HttpContext) {
    /** The index that ties the four service pages together */
    const url = canonical('/layanan')
    const seo = {
      path: '/layanan',
      title: 'Layanan Cuci & Reparasi di Bandung',
      description:
        'Empat layanan Umima.clean di Bandung: cuci sepatu, cuci tas, cuci helm, dan reparasi sepatu. Semuanya termasuk antar jemput GRATIS.',
      jsonLd: [
        webPage({
          canonical: url,
          name: `Layanan ${SITE.name}`,
          description: 'Cuci sepatu, cuci tas, cuci helm, dan reparasi sepatu di Bandung.',
          breadcrumb: true,
        }),
        breadcrumbList(url, [{ name: 'Layanan', url: canonical('/layanan') }]),
        itemList(
          url,
          SERVICES.map((entry) => ({ name: entry.name, url: canonical(entry.path) }))
        ),
      ],
    }

    return inertia.render('public/services_index', {}, withSeo(seo))
  }

  async service({ inertia, params, response }: HttpContext) {
    /** An unknown slug is a 404, never a soft redirect to a similar page */
    const entry = findService(params.slug)
    if (!entry) {
      return response.notFound('Halaman tidak ditemukan')
    }

    /** The service page carries its own Service node, priced from the real catalogue */
    const url = canonical(entry.path)
    const seo = {
      path: entry.path,
      title: entry.title,
      description: entry.description,
      jsonLd: [
        webPage({
          canonical: url,
          name: entry.headline,
          description: entry.description,
          breadcrumb: true,
        }),
        breadcrumbList(url, [
          { name: 'Layanan', url: canonical('/layanan') },
          { name: entry.name, url },
        ]),
        service({
          canonical: url,
          name: entry.name,
          serviceType: entry.serviceType,
          description: entry.description,
          offers: offersFrom(entry.items, url),
        }),
      ],
    }

    return inertia.render('public/service', { slug: entry.slug }, withSeo(seo))
  }

  async areas({ inertia }: HttpContext) {
    /** The coverage hub: what we cover, and just as usefully, what we do not */
    const url = canonical('/area')
    const seo = {
      path: '/area',
      title: 'Area Antar Jemput Gratis di Bandung',
      description: `Antar jemput gratis ke ${COVERED_KECAMATAN.length} kecamatan di Kota Bandung, Kota Cimahi, dan Kabupaten Bandung. Cek apakah alamat Anda termasuk.`,
      jsonLd: [
        webPage({
          canonical: url,
          name: 'Area antar jemput gratis',
          description: 'Daftar kecamatan yang dijangkau antar jemput gratis UmimaClean.',
          breadcrumb: true,
        }),
        breadcrumbList(url, [{ name: 'Area', url }]),
        itemList(
          url,
          AREAS.map((area) => ({ name: area.name, url: canonical(`/area/${area.slug}`) }))
        ),
      ],
    }

    return inertia.render('public/areas_index', {}, withSeo(seo))
  }

  async area({ inertia, params, response }: HttpContext) {
    /** An unknown area is a 404 — never a soft landing on the coverage hub */
    const area = findArea(params.slug)
    if (!area) {
      return response.notFound('Halaman tidak ditemukan')
    }

    /**
     * The page carries a Service node scoped to this place, so the offer and
     * the area it covers are stated together rather than left to be inferred
     * from the prose.
     */
    const url = canonical(`/area/${area.slug}`)
    const seo = {
      path: `/area/${area.slug}`,
      title: area.title,
      description: area.description,
      jsonLd: [
        webPage({
          canonical: url,
          name: area.headline,
          description: area.description,
          breadcrumb: true,
        }),
        breadcrumbList(url, [
          { name: 'Area', url: canonical('/area') },
          { name: area.name, url },
        ]),
        service({
          canonical: url,
          name: `Cuci sepatu ${area.name}`,
          serviceType: 'Cuci sepatu',
          description: area.description,
          areaServed: area.kecamatan.map((name) => ({
            '@type': 'AdministrativeArea',
            'name': name,
          })),
        }),
      ],
    }

    return inertia.render('public/area', { slug: area.slug }, withSeo(seo))
  }

  async pricing({ inertia }: HttpContext) {
    /** High-intent page: people searching a price are close to ordering */
    const url = canonical('/harga')
    const cheapest = Math.min(...SERVICES.map((entry) => priceFrom(entry)))
    const seo = {
      path: '/harga',
      title: `Harga Cuci Sepatu Bandung, Mulai ${rupiah(cheapest)}`,
      description: `Daftar harga cuci sepatu, cuci tas, cuci helm, dan reparasi sepatu di Bandung. Mulai ${rupiah(cheapest)}, sudah termasuk antar jemput GRATIS.`,
      jsonLd: [
        webPage({
          canonical: url,
          name: `Daftar harga ${SITE.name}`,
          description:
            'Harga cuci sepatu, cuci tas, cuci helm, dan reparasi sepatu di Bandung, termasuk antar jemput gratis.',
          breadcrumb: true,
        }),
        breadcrumbList(url, [{ name: 'Harga', url }]),
        itemList(
          url,
          SERVICES.map((entry) => ({ name: entry.name, url: canonical(entry.path) }))
        ),
      ],
    }

    return inertia.render('public/pricing', {}, withSeo(seo))
  }

  async faq({ inertia }: HttpContext) {
    /** FAQPage markup lives on this page only, never duplicated across the site */
    const url = canonical('/faq')
    const seo = {
      path: '/faq',
      title: 'FAQ Cuci & Reparasi Sepatu Bandung',
      description:
        'Lama pengerjaan, cara mengatur penjemputan gratis, bahan yang bisa ditangani, garansi, dan apa yang terjadi kalau sepatu tidak bisa diselamatkan.',
      jsonLd: [
        webPage({
          canonical: url,
          name: 'Pertanyaan yang sering masuk',
          description: 'Pertanyaan yang sering ditanyakan pelanggan Umima.clean di Bandung.',
          breadcrumb: true,
        }),
        breadcrumbList(url, [{ name: 'FAQ', url }]),
        faqPage(url, FAQS),
      ],
    }

    return inertia.render('public/faq', {}, withSeo(seo))
  }

  async about({ inertia }: HttpContext) {
    /** The other NAP page, and the one people land on from a brand search */
    const url = canonical('/tentang')
    const seo = {
      path: '/tentang',
      title: 'Tentang Umima.clean Bandung',
      description: `Umima.clean merawat sepatu, tas, dan helm di Bandung sejak dari Baleendah sampai basecamp di Margacinta. Antar jemput gratis ke ${COVERED_KECAMATAN.length} kecamatan.`,
      jsonLd: [
        webPage({
          canonical: url,
          name: `Tentang ${SITE.name}`,
          description: 'Profil, cara kerja, jangkauan, dan alamat Umima.clean di Bandung.',
          alsoTypes: ['AboutPage'],
          breadcrumb: true,
        }),
        breadcrumbList(url, [{ name: 'Tentang', url }]),
      ],
    }

    return inertia.render('public/about', {}, withSeo(seo))
  }

  async contact({ inertia }: HttpContext) {
    /** The NAP page — it must agree with the Google Business Profile exactly */
    const url = canonical('/kontak')
    const seo = {
      path: '/kontak',
      title: 'Kontak & Alamat di Bandung',
      description: `Hubungi Umima.clean di ${SITE.telephoneDisplay}. ${SITE.addressLine}. Buka setiap hari 09.30–20.30, dengan antar jemput GRATIS se-Bandung.`,
      jsonLd: [
        webPage({
          canonical: url,
          name: `Kontak ${SITE.name}`,
          description: `Alamat, telepon, dan jam buka Umima.clean di Bandung.`,
          alsoTypes: ['ContactPage'],
          breadcrumb: true,
        }),
        breadcrumbList(url, [{ name: 'Kontak', url }]),
      ],
    }

    return inertia.render('public/contact', {}, withSeo(seo))
  }
}
