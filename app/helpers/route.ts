import type { Point } from '#models/service_area'

const EARTH_RADIUS_METERS = 6_371_000
const WINDING_FACTOR = 1.3
const ESTIMATE_SPEED_KMH = 25

export function straightMeters(from: Point, to: Point) {
  const radians = (value: number) => (value * Math.PI) / 180
  const dLat = radians(to.lat - from.lat)
  const dLng = radians(to.lng - from.lng)
  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(from.lat)) * Math.cos(radians(to.lat)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

export function estimateLeg(from: Point, to: Point) {
  const meters = straightMeters(from, to) * WINDING_FACTOR
  return { meters, seconds: meters / (ESTIMATE_SPEED_KMH / 3.6) }
}
