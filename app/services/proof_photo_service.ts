import { randomUUID } from 'node:crypto'
import { rm } from 'node:fs/promises'
import { isAbsolute, join } from 'node:path'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import { DateTime } from 'luxon'
import type { PhotoKind } from '#enums/order_enum'
import type Order from '#models/order'
import OrderPhoto from '#models/order_photo'
import type User from '#models/user'
import env from '#start/env'

export const PHOTO_RETENTION_DAYS = 90

export function proofRoot() {
  const configured = env.get('PROOF_STORAGE_PATH') ?? 'storage/proofs'
  return isAbsolute(configured) ? configured : app.makePath(configured)
}

export function proofPath(relative: string) {
  return join(proofRoot(), relative)
}

export default class ProofPhotoService {
  async store(
    file: MultipartFile,
    order: Order,
    kind: PhotoKind,
    staff: User,
    transaction: TransactionClientContract
  ) {
    const relative = `${order.id}/${kind}-${randomUUID()}.${file.extname ?? 'jpg'}`
    await file.move(proofRoot(), { name: relative })
    transaction.after('rollback', () => this.#discard(relative))

    return OrderPhoto.create(
      { orderId: order.id, kind, path: relative, takenBy: staff.id },
      { client: transaction }
    )
  }

  async prune(days = PHOTO_RETENTION_DAYS) {
    const expired = await OrderPhoto.query()
      .whereNotNull('path')
      .where('created_at', '<', DateTime.now().minus({ days }).toJSDate())
    for (const photo of expired) {
      await this.#discard(photo.path!)
      photo.merge({ path: null, prunedAt: DateTime.now() })
      await photo.save()
    }
    return expired.length
  }

  async #discard(relative: string) {
    try {
      await rm(proofPath(relative), { force: true })
    } catch (error) {
      logger.warn({ err: error, photo: relative }, 'Could not delete a proof photo')
    }
  }
}
