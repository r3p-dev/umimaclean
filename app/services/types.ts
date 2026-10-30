import type { OtpPurpose } from '#enums/otp_enum'
import type { HttpContext } from '@adonisjs/core/http'
import type { Point } from '#models/service_area'

export type Session = HttpContext['session']

export type OtpIssueResult =
  { status: 'sent' } | { status: 'failed' } | { status: 'cooldown' | 'limited'; retryIn: number }

export type OtpCheckResult = 'valid' | 'invalid' | 'locked'

export type PasswordResetGrant = { userId: number; phone: string; expiresAt: string }

export type OtpFlow = {
  purpose: OtpPurpose
  phone: string
  failures: number
  name?: string
  passwordHash?: string
  userId?: number
}

export type PlaceRow = {
  kind: 'road' | 'poi'
  id: number
  name: string
  street: string | null
  lat: number
  lng: number
  kelurahan: string | null
  kecamatan: string | null
  city: string | null
}

export type PointAddress = {
  road: string | null
  kelurahan: string | null
  kecamatan: string | null
  city: string | null
  postcode: string | null
}

export type RoadLeg = { meters: number; seconds: number }

export type RoadRoute = RoadLeg & { path: Point[] }

export type RouteSource = 'osrm' | 'estimate'

export type TripLeg = RoadLeg & { source: RouteSource }
