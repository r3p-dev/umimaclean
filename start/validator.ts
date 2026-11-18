import { DateTime } from 'luxon'
import vine, { SimpleMessagesProvider, VineDate } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

vine.messagesProvider = new SimpleMessagesProvider({
  'required': 'Bagian ini wajib diisi.',
  'string': 'Bagian ini harus berupa teks.',
  'boolean': 'Bagian ini harus bernilai ya atau tidak.',
  'minLength': 'Minimal {{ min }} karakter.',
  'maxLength': 'Maksimal {{ max }} karakter.',
  'confirmed': 'Konfirmasi {{ field }} tidak cocok.',
  'database.unique': '{{ field }} sudah terdaftar.',
  'database.exists': '{{ field }} tidak ditemukan.',
  'phone.required': 'Nomor WhatsApp wajib diisi.',
  'password.required': 'Kata sandi wajib diisi.',
  'currentPassword.required': 'Kata sandi saat ini wajib diisi.',
  'fullName.required': 'Nama lengkap wajib diisi.',
  'name.required': 'Nama wajib diisi.',
  'terms.accepted': 'Setujui syarat & ketentuan untuk mendaftar.',
  'passwordConfirmation.sameAs': 'Kata sandi tidak sama.',
  'code.required': 'Kode verifikasi wajib diisi.',
  'code.regex': 'Kode verifikasi harus 6 digit angka.',
  'number': 'Bagian ini harus berupa angka.',
  'array': 'Bagian ini harus berupa daftar.',
  'enum': 'Pilihan tidak valid.',
  'min': 'Nilai minimal {{ min }}.',
  'max': 'Nilai maksimal {{ max }}.',
  'itemKinds.required': 'Pilih minimal satu jenis barang.',
  // VineJS names an array's length rule array.minLength.
  'itemKinds.array.minLength': 'Pilih minimal satu jenis barang.',
  'type.required': 'Pilih jenis layanan.',
  'price.required': 'Harga wajib diisi.',
  'price.min': 'Harga tidak boleh kurang dari {{ min }}.',
  'price.max': 'Harga tidak boleh lebih dari {{ max }}.',
  'description.required': 'Deskripsi wajib diisi.',
  'q.required': 'Ketik nama kecamatan.',
  'q.minLength': 'Ketik minimal {{ min }} huruf nama kecamatan.',
})
