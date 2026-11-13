import { DateTime } from 'luxon'
import { VineDate } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

// Validated dates become Luxon DateTime values, the type Lucid models use.
VineDate.transform((value) => DateTime.fromJSDate(value))
