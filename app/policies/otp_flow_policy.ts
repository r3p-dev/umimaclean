import { allowGuest, BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import { OtpPurpose } from '#enums/otp_enum'
import type User from '#models/user'
import type { OtpFlow } from '#services/otp_service'

export default class OtpFlowPolicy extends BasePolicy {
  @allowGuest()
  continue(user: User | null, flow: OtpFlow): AuthorizerResponse {
    if (flow.purpose === OtpPurpose.CHANGE_PHONE) {
      return user?.id === flow.userId
    }

    return user === null
  }
}
