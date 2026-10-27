import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import { Role } from '#enums/role_enum'
import { normalizePhone } from '#helpers/phone'
import User from '#models/user'
import env from '#start/env'

const DEMO_ADMIN_PHONE = '6281322478105'

export default class extends BaseSeeder {
  override async run() {
    if (await User.query().where('role', Role.ADMIN).first()) {
      logger.info('An owner account already exists, skipping')
      return
    }

    const configured = env.get('ADMIN_PHONE')
    if (!configured && app.inProduction) {
      throw new Error("Set ADMIN_PHONE to the owner's WhatsApp number")
    }

    const phone = normalizePhone(configured ?? DEMO_ADMIN_PHONE)
    if (!phone) {
      throw new Error('ADMIN_PHONE is not a valid Indonesian mobile number')
    }

    await User.create({
      role: Role.ADMIN,
      name: 'Umi Maryam',
      phone,
      password: 'password',
      isActive: true,
      phoneVerifiedAt: DateTime.now(),
    })
    logger.info(`Owner account ${phone}, password "password": change it in Profil after signing in`)
  }
}
