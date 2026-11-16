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
  'fullName.required': 'Nama lengkap wajib diisi.',
})
