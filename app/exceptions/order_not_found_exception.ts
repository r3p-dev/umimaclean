import { Exception } from '@adonisjs/core/exceptions'

export default class OrderNotFoundException extends Exception {
  static override status = 404
  static override code = 'E_ORDER_NOT_FOUND'
  static override message = 'Pesanan tidak ditemukan'
}
