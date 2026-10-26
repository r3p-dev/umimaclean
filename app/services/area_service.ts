import { ActivityAction } from '#enums/activity_enum'
import ActivityLog from '#models/activity_log'
import ServiceArea, { type Point } from '#models/service_area'
import type User from '#models/user'

export default class AreaService {
  async checkAreaCoverage(point: Point) {
    const area = await ServiceArea.contains(point)
    return { covered: area !== null, name: area ? `${area.name}, ${area.city}` : null }
  }

  async listAreasForOwner(query: string) {
    const term = `%${query}%`
    const [active, results] = await Promise.all([
      ServiceArea.active(),
      query
        ? ServiceArea.summary().where((builder) => {
            builder.whereILike('name', term).orWhereILike('city', term)
          })
        : [],
    ])
    return { active, results }
  }

  async setAreaActive(owner: User, id: number, isActive: boolean) {
    const area = await ServiceArea.summary().where('id', id).firstOrFail()

    await area.merge({ isActive: isActive }).save()
    await ActivityLog.record({
      actor: owner,
      action: ActivityAction.SETTINGS_CHANGED,
      detail: `Area layanan: Kec. ${area.name}, ${area.city} ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
    })

    return area
  }

  listAreaSummaries() {
    return ServiceArea.summary()
  }
}
