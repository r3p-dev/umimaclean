import { BaseSeeder } from '@adonisjs/lucid/seeders'
import ServiceDistrict from '#models/service_district'
import { DEFAULT_COVERAGE, coverageRows } from '#services/area_service'

export default class extends BaseSeeder {
  override async run() {
    if (!(await ServiceDistrict.query().first())) {
      await ServiceDistrict.createMany(coverageRows(DEFAULT_COVERAGE))
    }
  }
}
