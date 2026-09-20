import vine from '@vinejs/vine'

import { SERVICES } from '#content/services'
import { COVERED_KECAMATAN } from '#content/areas'

/**
 * An order placed from the public site.
 *
 * The kecamatan is an enum drawn from the coverage list rather than free text.
 * That is the whole point: a request the site accepts is a request we can
 * actually serve, so nobody is promised a free pickup we then have to refuse.
 */
export const orderRequestValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(80),

  /**
   * Indonesian mobile numbers, however the customer happens to type them —
   * 08xx, 628xx, or +628xx.
   */
  phone: vine
    .string()
    .trim()
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,11}$/),

  kecamatan: vine.enum(COVERED_KECAMATAN as readonly string[]),

  addressNote: vine.string().trim().minLength(10).maxLength(500),

  serviceSlug: vine.enum(SERVICES.map((service) => service.slug)),

  notes: vine.string().trim().maxLength(500).optional(),
})
