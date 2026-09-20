/**
 * The business's identity, as plain data.
 *
 * This file is imported by the server (to build the JSON-LD graph) and by the
 * React layout (to print the footer). It deliberately imports nothing — no env,
 * no framework — so that one set of NAP values serves both. A second copy for
 * the client would drift, and a footer that disagrees with the schema is
 * exactly the inconsistency that stops Google merging the site with the
 * Google Business Profile.
 *
 * Every value matches the Google Business Profile character for character.
 * Do not edit without the owner saying so.
 */

export const SITE = {
  name: 'Umima.clean',

  /** Spaced, as the logo sets it. */
  displayName: 'Umima Clean',

  tagline: 'Cuci sepatu, tas, helm, dan reparasi sepatu di Bandung',

  description:
    'Umima.clean mencuci sepatu, tas, helm, dan reparasi sepatu di Bandung. ' +
    'Antar jemput GRATIS ke seluruh Bandung, dikerjakan 2-4 hari kerja.',

  locale: 'id-ID',

  telephone: '+6285157900974',
  telephoneDisplay: '0851-5790-0974',
  /** For questions and complaints. Orders come through the site. */
  whatsapp: 'https://wa.me/6285157900974',

  /** The Google Business Profile short link, also emitted as sameAs. */
  mapsUrl: 'https://maps.app.goo.gl/Dds7B7gRs9t9pGiP7',

  /**
   * Verbatim from the Google Business Profile. No RT/RW — the profile carries
   * none, and adding one breaks the string match that lets Google merge this
   * site with the profile into a single business entity.
   */
  address: {
    streetAddress: 'Jl. Margacinta No.132, Margasari, Kec. Buahbatu',
    addressLocality: 'Kota Bandung',
    addressRegion: 'Jawa Barat',
    postalCode: '40286',
    addressCountry: 'ID',
  },

  /**
   * The four address fields concatenated, reproducing the Google Business
   * Profile address string exactly. One string, so the footer and the contact
   * page cannot disagree with each other or with the profile.
   */
  addressLine: 'Jl. Margacinta No.132, Margasari, Kec. Buahbatu, Kota Bandung, Jawa Barat 40286',

  geo: {
    latitude: -6.955631,
    longitude: 107.6539748,
  },

  /** Open seven days. */
  openingHours: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '09:30',
    closes: '20:30',
  },

  openingHoursLabel: 'Setiap hari, 09.30-20.30',

  /** Cheapest standalone service to the dearest, add-ons excluded. */
  priceRange: 'Rp30.000-Rp180.000',

  currency: 'IDR',

  logo: '/images/logo.jpg',
  image: '/images/logo_full.jpg',
} as const

/**
 * Social and directory profiles, emitted as `sameAs`.
 *
 * Only real, verified profiles. Inventing one would aim the strongest
 * entity-matching signal Google has at a page that may not exist.
 *
 * The WhatsApp link is deliberately absent: it is a way to contact the
 * business, not a profile that identifies it, so it belongs on a ContactPoint
 * instead. Instagram and TikTok are pending and will be added when supplied.
 */
export const PROFILES: readonly string[] = ['https://maps.app.goo.gl/Dds7B7gRs9t9pGiP7']
