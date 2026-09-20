/**
 * JSON-LD as one `@graph` of `@id`-anchored nodes.
 *
 * The point of the `@id` pattern is that the business is described once, at a
 * stable URI, and every other node points at it. A service page does not
 * repeat the address; it says `provider: { '@id': BUSINESS_ID }`. Search
 * engines follow that reference, and the business accumulates one coherent
 * entity across the whole site instead of a dozen near-duplicate copies that
 * disagree the moment someone edits one of them.
 *
 * Anchors:
 *
 *   ${ORIGIN}/#business                  LocalBusiness
 *   ${ORIGIN}/#website                   WebSite
 *   ${ORIGIN}/#antar-jemput-gratis       Service — free pickup and delivery
 *   ${canonical}#webpage                 WebPage
 *   ${canonical}#breadcrumb              BreadcrumbList
 *   ${canonical}#service                 Service
 *
 * Never add `aggregateRating` or `review` here. See app/content/site.ts.
 */

import { SERVICES, type PriceItem } from '#content/services'
import { ORIGIN, SITE, PROFILES, absolute } from '#seo/config'
import { KABUPATEN_BANDUNG } from '#content/areas'

export const BUSINESS_ID = `${ORIGIN}/#business`
export const WEBSITE_ID = `${ORIGIN}/#website`
export const PICKUP_SERVICE_ID = `${ORIGIN}/#antar-jemput-gratis`

/** Drop keys whose value is undefined, so optional fields simply vanish. */
function compact<T extends Record<string, unknown>>(node: T) {
  return Object.fromEntries(Object.entries(node).filter(([, value]) => value !== undefined)) as T
}

/**
 * Where the free pickup runs.
 *
 * Named places only — never the operational polygon's coordinates. `areaServed`
 * does accept a GeoShape, but hundreds of coordinate pairs in the head of every
 * page is real weight against the performance target and buys no search signal.
 * Names are what people type and what engines match.
 *
 * Two City nodes cover the 33 kecamatan of Kota Bandung and Kota Cimahi
 * semantically, so the ten Kabupaten Bandung kecamatan are the only ones that
 * need naming individually. Twelve nodes instead of forty-three, and no less
 * accurate.
 */
export function areaServed() {
  return [
    { '@type': 'City', 'name': 'Kota Bandung' },
    { '@type': 'City', 'name': 'Kota Cimahi' },
    ...KABUPATEN_BANDUNG.map((name) => ({ '@type': 'AdministrativeArea', 'name': name })),
  ]
}

/**
 * The business itself.
 *
 * schema.org has no shoe-cleaning or shoe-repair type, so this is a
 * `LocalBusiness` disambiguated with productontology `additionalType` URIs.
 * That is the accepted way to say "this specific kind of business" without
 * inventing a type that no consumer understands.
 */
export function localBusiness() {
  return compact({
    '@type': 'LocalBusiness',
    '@id': BUSINESS_ID,
    'additionalType': [
      'http://www.productontology.org/id/Shoe_cleaning',
      'http://www.productontology.org/id/Shoe_repair',
    ],
    'name': SITE.name,
    'description': SITE.description,
    'url': `${ORIGIN}/`,
    'image': absolute(SITE.image),
    'logo': absolute(SITE.logo),
    'telephone': SITE.telephone,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': SITE.address.streetAddress,
      'addressLocality': SITE.address.addressLocality,
      'addressRegion': SITE.address.addressRegion,
      'postalCode': SITE.address.postalCode,
      'addressCountry': SITE.address.addressCountry,
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': SITE.geo.latitude,
      'longitude': SITE.geo.longitude,
    },
    'openingHoursSpecification': [
      {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': SITE.openingHours.days,
        'opens': SITE.openingHours.opens,
        'closes': SITE.openingHours.closes,
      },
    ],
    'priceRange': SITE.priceRange,
    'currenciesAccepted': SITE.currency,
    'areaServed': areaServed(),

    /**
     * The four services plus free pickup. The service nodes are referenced by
     * the same `@id` their own pages use, so the catalogue entry and the full
     * description on the service page are understood as one thing.
     */
    'hasOfferCatalog': {
      '@type': 'OfferCatalog',
      '@id': `${ORIGIN}/#layanan`,
      'name': `Layanan ${SITE.name}`,
      'itemListElement': [
        ...SERVICES.map((entry) => ({
          '@type': 'Offer',
          'itemOffered': {
            '@type': 'Service',
            '@id': `${absolute(entry.path)}#service`,
            'name': entry.name,
            'url': absolute(entry.path),
          },
        })),
        {
          '@type': 'Offer',
          'price': 0,
          'priceCurrency': SITE.currency,
          'itemOffered': { '@id': PICKUP_SERVICE_ID },
        },
      ],
    },

    'makesOffer': { '@id': PICKUP_SERVICE_ID },

    /**
     * Ordering happens on the site, so say so in machine-readable form too.
     * The zero delivery charge restates the free-pickup claim where a consumer
     * can act on it rather than only read it in prose.
     */
    'potentialAction': {
      '@type': 'OrderAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': `${ORIGIN}/pesan`,
        'actionPlatform': [
          'http://schema.org/DesktopWebPlatform',
          'http://schema.org/MobileWebPlatform',
        ],
      },
      'deliveryMethod': 'http://purl.org/goodrelations/v1#DeliveryModePickUp',
      'priceSpecification': {
        '@type': 'DeliveryChargeSpecification',
        'price': 0,
        'priceCurrency': SITE.currency,
      },
    },

    /**
     * WhatsApp is how customers reach the business, so it is a ContactPoint.
     * It is deliberately not in `sameAs`, which is for profiles identifying the
     * same entity elsewhere — a chat link there muddies the very signal
     * `sameAs` exists to give.
     */
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer service',
      'telephone': SITE.telephone,
      'url': SITE.whatsapp,
      'availableLanguage': ['id'],
    },

    /** Real, verified profiles only. */
    'sameAs': PROFILES.length > 0 ? [...PROFILES] : undefined,
  })
}

/**
 * Free pickup and delivery, modelled explicitly as a zero-price Offer.
 *
 * No crawler can infer "free pickup" from marketing copy, and this is the
 * claim most likely to win the click against a competitor who charges for it.
 * So it is a first-class node with a real price of 0 IDR and a real
 * areaServed, not an adjective in a paragraph.
 */
export function freePickupService() {
  return {
    '@type': 'Service',
    '@id': PICKUP_SERVICE_ID,
    'name': 'Antar jemput gratis',
    'serviceType': 'Antar jemput gratis',
    'description':
      'Penjemputan dan pengantaran kembali tanpa biaya untuk seluruh area layanan Umima.clean di Bandung.',
    'provider': { '@id': BUSINESS_ID },
    'areaServed': areaServed(),
    'offers': {
      '@type': 'Offer',
      'price': 0,
      'priceCurrency': SITE.currency,
      'availability': 'https://schema.org/InStock',
      'url': `${ORIGIN}/`,
    },
  }
}

export function website(description: string = SITE.description) {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    'url': `${ORIGIN}/`,
    'name': SITE.name,
    'description': description,
    'inLanguage': SITE.locale,
    'publisher': { '@id': BUSINESS_ID },
  }
}

/**
 * The nodes that describe the site rather than the page. Every public page
 * carries these, so the business entity is reinforced everywhere rather than
 * only on the homepage.
 */
export function siteNodes(description?: string) {
  return [localBusiness(), freePickupService(), website(description)]
}

export function webPage(options: {
  canonical: string
  name: string
  description: string
  /** Extra types, e.g. ['FAQPage'] or ['AboutPage'] — merged into @type. */
  alsoTypes?: readonly string[]
  breadcrumb?: boolean
  dateModified?: string
  mainEntity?: object | readonly object[]
}) {
  const types = ['WebPage', ...(options.alsoTypes ?? [])]

  return compact({
    '@type': types.length === 1 ? 'WebPage' : types,
    '@id': `${options.canonical}#webpage`,
    'url': options.canonical,
    'name': options.name,
    'description': options.description,
    'inLanguage': SITE.locale,
    'isPartOf': { '@id': WEBSITE_ID },
    'about': { '@id': BUSINESS_ID },
    'breadcrumb': options.breadcrumb ? { '@id': `${options.canonical}#breadcrumb` } : undefined,
    'dateModified': options.dateModified,
    'mainEntity': options.mainEntity as object | undefined,
  })
}

/**
 * Turn a price list into Offers.
 *
 * A "start from" price is emitted as a `minPrice` on a PriceSpecification
 * rather than an exact `price`, because saying Premium For Suede costs exactly
 * Rp120.000 when the page says "mulai dari" would be a claim the business does
 * not make. Add-ons are excluded: they are not separately purchasable.
 */
export function offersFrom(items: readonly PriceItem[], url: string) {
  return items
    .filter((item) => item.kind !== 'additional')
    .map((item) =>
      compact({
        '@type': 'Offer',
        'name': item.name,
        'description': item.description,
        'priceCurrency': SITE.currency,
        'price': item.kind === 'regular' ? item.price : undefined,
        'priceSpecification':
          item.kind === 'startFrom'
            ? {
                '@type': 'PriceSpecification',
                'minPrice': item.price,
                'priceCurrency': SITE.currency,
              }
            : undefined,
        'availability': 'https://schema.org/InStock',
        'url': url,
      })
    )
}

export function service(options: {
  canonical: string
  name: string
  serviceType: string
  description: string
  offers?: readonly object[]
  areaServed?: readonly object[]
}) {
  return compact({
    '@type': 'Service',
    '@id': `${options.canonical}#service`,
    'name': options.name,
    'serviceType': options.serviceType,
    'description': options.description,
    'url': options.canonical,
    'provider': { '@id': BUSINESS_ID },
    'areaServed': (options.areaServed ?? areaServed()) as readonly object[],
    'offers': options.offers as readonly object[] | undefined,
  })
}

/** Breadcrumbs. The trail excludes the home crumb — it is added here. */
export function breadcrumbList(
  canonicalUrl: string,
  trail: readonly { name: string; url: string }[]
) {
  const crumbs = [{ name: 'Beranda', url: `${ORIGIN}/` }, ...trail]

  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    'itemListElement': crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.name,
      'item': crumb.url,
    })),
  }
}

export function faqPage(
  canonicalUrl: string,
  items: readonly { question: string; answer: string }[]
) {
  return {
    '@type': 'FAQPage',
    '@id': `${canonicalUrl}#faq`,
    'mainEntity': items.map((item) => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': { '@type': 'Answer', 'text': item.answer },
    })),
  }
}

/** For index and listing pages — the services index, the area index. */
export function itemList(canonicalUrl: string, items: readonly { name: string; url: string }[]) {
  return {
    '@type': 'ItemList',
    '@id': `${canonicalUrl}#list`,
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'url': item.url,
    })),
  }
}
