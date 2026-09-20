import type { HttpContext } from '@adonisjs/core/http'

import OrderRequest from '#models/order_request'
import { orderRequestValidator } from '#validators/order_request'
import { withSeo } from '#seo/render'
import { canonical } from '#seo/urls'
import { SERVICES } from '#content/services'
import { webPage, breadcrumbList } from '#seo/schema'

/**
 * The booking flow — the site's front door.
 *
 * Orders come through here, not over WhatsApp. That is a business decision
 * with a real cost behind it: a chat thread has to be staffed, read, and
 * transcribed by hand, while a form arrives already structured and already
 * checked against the coverage area.
 */
export default class OrderRequestController {
  async create({ inertia, request }: HttpContext) {
    /**
     * Service pages link here with the service already chosen, so the
     * customer does not have to answer a question they just answered by
     * clicking. Anything unrecognised is ignored rather than trusted.
     */
    const requested = request.input('layanan')
    const preselected = SERVICES.some((service) => service.slug === requested)
      ? (requested as string)
      : null

    /** A high-intent page in its own right: people search for how to order */
    const url = canonical('/pesan')
    const seo = {
      path: '/pesan',
      title: 'Pesan Cuci Sepatu Bandung — Jemput Gratis',
      description: `Pesan cuci sepatu, tas, helm, atau reparasi di Bandung. Isi formulir, kami jemput gratis ke alamat Anda. Buka setiap hari 09.30–20.30.`,
      jsonLd: [
        webPage({
          canonical: url,
          name: 'Pesan layanan UmimaClean',
          description:
            'Formulir pemesanan cuci dan reparasi dengan antar jemput gratis di Bandung.',
          breadcrumb: true,
        }),
        breadcrumbList(url, [{ name: 'Pesan', url }]),
      ],
    }

    return inertia.render(
      'public/order',
      { preselected, csrfToken: request.csrfToken },
      withSeo(seo)
    )
  }

  async store({ request, response, session }: HttpContext) {
    /** Validate before anything else touches the database */
    const payload = await request.validateUsing(orderRequestValidator)

    /** Record the request; Phase 5 attaches scheduling and a status to it */
    await OrderRequest.create({
      name: payload.name,
      phone: payload.phone,
      kecamatan: payload.kecamatan,
      addressNote: payload.addressNote,
      serviceSlug: payload.serviceSlug,
      notes: payload.notes ?? null,
    })

    /** Redirect after post, so a refresh cannot place the order twice */
    session.flash(
      'success',
      `Pesanan Anda sudah masuk. Tim kami akan menghubungi ${payload.phone} untuk memastikan jadwal penjemputan.`
    )

    return response.redirect().toRoute('order.create')
  }
}
