import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { enterAdminArea } from '#abilities/main'
import OperatingCost from '#models/operating_cost'
import Setting from '#models/setting'
import ReportService from '#services/report_service'
import { saveCostValidator } from '#validators/admin/cost'

@inject()
export default class DashboardController {
  constructor(protected reports: ReportService) {}

  async summary({ inertia }: HttpContext) {
    const [report, costs, inactiveDays, customers, recent] = await Promise.all([
      this.reports.days(),
      this.reports.costs(),
      Setting.get('inactive_days'),
      this.reports.customers(),
      this.reports.activity(3),
    ])
    return inertia.render('admin/summary', {
      report,
      services: await this.reports.services(report.start),
      costs,
      inactiveDays,
      inactiveCount: customers.filter(
        (customer) => customer.hasPaid && customer.days >= inactiveDays
      ).length,
      recent,
    })
  }

  async customers({ inertia }: HttpContext) {
    const [customers, inactiveDays] = await Promise.all([
      this.reports.customers(),
      Setting.get('inactive_days'),
    ])
    return inertia.render('admin/customers', { customers, inactiveDays })
  }

  async activityLog({ inertia }: HttpContext) {
    return inertia.render('admin/activity', { activities: await this.reports.activity() })
  }

  async reportsPage({ inertia }: HttpContext) {
    const [report, costs] = await Promise.all([this.reports.days(), this.reports.costs()])
    return inertia.render('admin/reports', { report, costs })
  }

  async storeCost({ auth, bouncer, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const payload = await request.validateUsing(saveCostValidator)
    const cost = await this.reports.saveCost(auth.getUserOrFail(), payload, null)
    session.flash('success', `Biaya “${cost.note}” ditambahkan. Laba dihitung ulang.`)
    return response.redirect().toRoute('admin.reports')
  }

  async updateCost({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const cost = await OperatingCost.findOrFail(params.id)
    const payload = await request.validateUsing(saveCostValidator)
    await this.reports.saveCost(auth.getUserOrFail(), payload, cost)
    session.flash('success', 'Biaya diperbarui. Laba dihitung ulang.')
    return response.redirect().toRoute('admin.reports')
  }

  async destroyCost({ auth, bouncer, params, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const cost = await this.reports.removeCost(auth.getUserOrFail(), Number(params.id))
    session.flash('success', `Biaya “${cost.note}” dihapus. Laba dihitung ulang.`)
    return response.redirect().toRoute('admin.reports')
  }
}
