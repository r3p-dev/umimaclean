import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import ActivityLog from '#models/activity_log'
import ServiceArea from '#models/service_area'
import type User from '#models/user'
import { editDistance, normalizeDistrictName } from '#helpers/district_name'

export interface CoverageCheckResult {
  isCovered: boolean
  district: ServiceArea | null
}

// Display geometry may be up to about 120 m off the real borders; it is only drawn, never checked (D95).
const DISPLAY_TOLERANCE_DEGREES = 0.0005

@inject()
export default class AreaService {
  async getAllAreas(): Promise<ServiceArea[]> {
    return ServiceArea.query().withScopes((scopes) => scopes.ordered())
  }

  // ST_CoverageSimplify keeps shared borders shared, so neighbours never gap or overlap on the map.
  // It returns geometries without an SRID (PostGIS 3.6.4), hence ST_SetSRID.
  async getAreaShapes(): Promise<ServiceArea[]> {
    return ServiceArea.query()
      .select('id', 'city', 'name', 'code', 'is_active')
      .select(
        db.raw(
          'ST_AsGeoJSON(ST_SetSRID(ST_CoverageSimplify(boundary, ?) OVER (), 4326), 5) AS shape',
          [DISPLAY_TOLERANCE_DEGREES]
        )
      )
      .withScopes((scopes) => scopes.ordered())
  }

  // The district a guest typed in the landing check: forgiving of case, a "Kec." prefix, spaces and
  // one or two wrong letters, but never a guess between names further apart (GUEST-1, D100).
  async findAreaByName(query: string): Promise<ServiceArea | null> {
    const typed = normalizeDistrictName(query)
    const allowedTypos = typed.length <= 5 ? 1 : 2
    let best: { area: ServiceArea; distance: number } | null = null

    for (const area of await this.getAllAreas()) {
      const distance = editDistance(typed, normalizeDistrictName(area.name))
      if (distance <= allowedTypos && (!best || distance < best.distance)) {
        best = { area, distance }
      }
    }
    return best?.area ?? null
  }

  async getGroupedAreas(): Promise<Record<string, ServiceArea[]>> {
    const areas = await this.getAllAreas()
    const grouped: Record<string, ServiceArea[]> = {}

    for (const area of areas) {
      if (!grouped[area.city]) {
        grouped[area.city] = []
      }
      grouped[area.city].push(area)
    }

    return grouped
  }

  async toggleArea(id: number, actor: User, nextActiveState?: boolean): Promise<ServiceArea> {
    const area = await ServiceArea.find(id)
    if (!area) {
      throw new Exception('Area layanan tidak ditemukan.', { status: 404 })
    }

    const previous = area.isActive
    area.isActive = nextActiveState !== undefined ? nextActiveState : !area.isActive
    await area.save()

    await ActivityLog.create({
      userId: actor.id,
      category: 'area',
      action: 'area.toggle',
      description: `Mengubah status area "${area.name}" (${area.city}): ${previous ? 'Aktif' : 'Nonaktif'} → ${area.isActive ? 'Aktif' : 'Nonaktif'}`,
      isSensitive: false,
    })

    return area
  }

  /**
   * Server-side point-in-polygon check against active districts (AREA-4).
   * Note: Longitude (X) precedes Latitude (Y) in ST_MakePoint(lng, lat).
   */
  async checkCoverage(lat: number, lng: number): Promise<CoverageCheckResult> {
    const area = await ServiceArea.query()
      .whereRaw('ST_Intersects(boundary, ST_SetSRID(ST_MakePoint(?, ?), 4326))', [lng, lat])
      // A point on a shared border matches both districts; an active one wins, so it counts as covered.
      .orderBy('is_active', 'desc')
      .orderBy('code', 'asc')
      .first()

    if (!area) {
      return { isCovered: false, district: null }
    }

    return {
      isCovered: area.isActive,
      district: area,
    }
  }
}
