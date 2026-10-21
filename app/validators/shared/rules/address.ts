import vine from '@vinejs/vine'

export const addressRule = vine.createRule((value, _options, field) => {
  if (typeof value !== 'string') {
    return
  }

  if (!value) {
    field.report('Isi alamat penjemputan.', 'address.required', field)
  } else if (value.length < 10) {
    field.report('Lengkapi alamat: nama jalan, nomor rumah, RT/RW.', 'address.minLength', field)
  } else if (value.length > 300) {
    field.report('Alamat maksimal 300 karakter.', 'address.maxLength', field)
  }
})
