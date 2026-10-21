import { Exception } from '@adonisjs/core/exceptions'

export default class AddressNotFoundException extends Exception {
  static override status = 404
  static override code = 'E_ADDRESS_NOT_FOUND'
  static override message = 'Alamat tidak ditemukan'
}
