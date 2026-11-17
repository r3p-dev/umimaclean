import { BaseTransformer } from '@adonisjs/core/transformers'
import type { OpeningHoursSetting } from '#services/setting_service'

export default class OpeningHoursTransformer extends BaseTransformer<OpeningHoursSetting> {
  toObject() {
    return {
      days: this.resource.days.map((day) => ({
        day: day.day,
        isOpen: day.isOpen,
        opens: day.opens,
        closes: day.closes,
      })),
      closure: {
        isClosed: this.resource.closure.isClosed,
        startsAt: this.resource.closure.startsAt,
        endsAt: this.resource.closure.endsAt,
        note: this.resource.closure.note,
      },
    }
  }
}
