import { inject } from '@adonisjs/core'
import { Exception } from '@adonisjs/core/exceptions'
import ActivityLog from '#models/activity_log'
import ServiceArea from '#models/service_area'
import type User from '#models/user'

export interface CoverageCheckResult {
  isCovered: boolean
  district: ServiceArea | null
}

@inject()
export default class AreaService {
  async getAllAreas(): Promise<ServiceArea[]> {
    return ServiceArea.query().withScopes((scopes) => scopes.ordered())
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
