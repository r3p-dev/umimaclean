import { ActivityAction } from '#enums/activity_enum'
import ActivityLog from '#models/activity_log'
import ServiceArea, { type Point } from '#models/service_area'
import type User from '#models/user'

export default class AreaService {
  async check(point: Point) {
    const area = await ServiceArea.contains(point)
    return { covered: area !== null, name: area ? `${area.name}, ${area.city}` : null }
  }

  search(query: string) {
    const term = `%${query}%`
    return ServiceArea.summary().where((builder) => {
      builder.whereILike('name', term).orWhereILike('city', term)
    })
  }

  async setActive(owner: User, id: number, isActive: boolean) {
    const area = await ServiceArea.summary().where('id', id).firstOrFail()
    area.isActive = isActive
    await area.save()
    await ActivityLog.record({
      actor: owner,
      action: ActivityAction.SETTINGS_CHANGED,
      detail: `Area layanan: Kec. ${area.name}, ${area.city} ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
    })
    return area
  }
}
