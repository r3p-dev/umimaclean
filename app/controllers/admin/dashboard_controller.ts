import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { enterAdminArea } from '#abilities/main'
import { ActivityAction } from '#enums/activity_enum'
import { CostCategory, CostCategoryLabel } from '#enums/cost_enum'
import OperatingCost from '#models/operating_cost'
import ActivityService from '#services/activity_service'
import CustomerInsightService from '#services/customer_insight_service'
import { formatRupiah } from '#services/notification_service'
import ReportService from '#services/report_service'
import SettingsService from '#services/settings_service'
import { remindCustomersValidator } from '#validators/admin/customer'
import { saveCostValidator } from '#validators/admin/cost'

const CATEGORY_OF = Object.fromEntries(
  Object.entries(CostCategoryLabel).map(([key, label]) => [label, key])
) as Record<string, CostCategory>

@inject()
export default class DashboardController {
  constructor(
    protected reports: ReportService,
    protected insights: CustomerInsightService,
    protected settings: SettingsService,
    protected activity: ActivityService
  ) {}

  async summary({ inertia }: HttpContext) {
    const [report, costs, inactiveDays, customers, recent] = await Promise.all([
      this.reports.days(),
      this.reports.costs(),
      this.settings.get('inactive_days'),
      this.insights.customers(),
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
      this.insights.customers(),
      this.settings.get('inactive_days'),
    ])
    return inertia.render('admin/customers', { customers, inactiveDays })
  }

  async remind({ auth, bouncer, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const { ids, message } = await request.validateUsing(remindCustomersValidator)
    const result = await this.insights.remind(auth.getUserOrFail(), ids, message)
    const parts = [
      result.sent && `${result.sent} terkirim via WhatsApp`,
      result.logged && `${result.logged} hanya dicatat di log (WhatsApp belum dikonfigurasi)`,
      result.failed && `${result.failed} gagal`,
      result.skipped && `${result.skipped} dilewati karena sudah diingatkan 7 hari terakhir`,
    ].filter(Boolean)
    session.flash(
      result.sent || result.logged ? 'success' : 'error',
      `Pengingat: ${parts.join(', ')}.`
    )
    return response.redirect().toRoute('admin.customers')
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
    const owner = auth.getUserOrFail()
    const cost = await OperatingCost.create({
      category: CATEGORY_OF[payload.category],
      note: payload.detail,
      amount: payload.amount,
      spentOn: payload.date,
      createdBy: owner.id,
    })
    await this.activity.record({
      actor: owner,
      action: ActivityAction.COST_CHANGED,
      detail: `Menambah biaya ${cost.note} ${formatRupiah(cost.amount)}`,
    })
    session.flash('success', `Biaya “${cost.note}” ditambahkan. Laba dihitung ulang.`)
    return response.redirect().toRoute('admin.reports')
  }

  async updateCost({ auth, bouncer, params, request, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const cost = await OperatingCost.findOrFail(params.id)
    const payload = await request.validateUsing(saveCostValidator)
    const before = `${cost.note} ${formatRupiah(cost.amount)}`
    cost.merge({
      category: CATEGORY_OF[payload.category],
      note: payload.detail,
      amount: payload.amount,
      spentOn: payload.date,
    })
    await cost.save()
    await this.activity.record({
      actor: auth.getUserOrFail(),
      action: ActivityAction.COST_CHANGED,
      detail: `${before} → ${cost.note} ${formatRupiah(cost.amount)}`,
      isSensitive: true,
    })
    session.flash('success', 'Biaya diperbarui. Laba dihitung ulang.')
    return response.redirect().toRoute('admin.reports')
  }

  async destroyCost({ auth, bouncer, params, response, session }: HttpContext) {
    await bouncer.authorize(enterAdminArea)
    const cost = await OperatingCost.findOrFail(params.id)
    await cost.delete()
    await this.activity.record({
      actor: auth.getUserOrFail(),
      action: ActivityAction.COST_CHANGED,
      detail: `Menghapus biaya ${cost.note} ${formatRupiah(cost.amount)}`,
      isSensitive: true,
    })
    session.flash('success', `Biaya “${cost.note}” dihapus. Laba dihitung ulang.`)
    return response.redirect().toRoute('admin.reports')
  }
}
