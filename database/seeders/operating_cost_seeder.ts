import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import { CostCategory } from '#enums/cost_enum'
import { Role } from '#enums/role_enum'
import OperatingCost from '#models/operating_cost'
import User from '#models/user'
import { SERVICE_ZONE } from '#validators/shared/rules/pickup'

export default class extends BaseSeeder {
  override async run() {
    if (await OperatingCost.query().first()) {
      return
    }
    const owner = await User.query().where('role', Role.ADMIN).firstOrFail()
    const month = DateTime.now().setZone(SERVICE_ZONE).startOf('month')
    await OperatingCost.createMany([
      {
        category: CostCategory.RENT,
        note: 'Sewa ruko',
        amount: 3000000,
        spentOn: month,
        createdBy: owner.id,
      },
      {
        category: CostCategory.SALARY,
        note: 'Gaji 2 staf',
        amount: 3500000,
        spentOn: month,
        createdBy: owner.id,
      },
      {
        category: CostCategory.SUPPLIES,
        note: 'Sabun, sikat, deodorizer',
        amount: 700000,
        spentOn: month.plus({ days: 2 }),
        createdBy: owner.id,
      },
    ])
  }
}
