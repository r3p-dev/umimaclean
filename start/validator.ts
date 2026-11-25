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
  'lat.required': 'Pilih lokasi di peta dulu.',
  'addressText.required': 'Isi nama jalan, gedung atau no. rumah.',
  // VineJS names an array's length rule array.minLength.
  'items.array.minLength': 'Tambahkan minimal satu barang.',
  'items.perKind': 'Maksimal {{ max }} sepatu dan {{ max }} tas per pesanan.',
  'items.*.itemKind.enum': 'Pesanan online hanya untuk sepatu dan tas; helm dilayani di toko.',
  'items.*.type.required': 'Isi jenis barang, mis. Air Force 1 atau ransel kanvas.',
  'items.*.type.minLength': 'Isi jenis barang, mis. Air Force 1 atau ransel kanvas.',
  'items.*.size.required': 'Pilih ukuran barang.',
  'items.*.size.regex': 'Ukuran sepatu EU 20–50, kelipatan 0,5.',
  'items.*.size.enum': 'Pilih ukuran tas: Small, Medium, Large atau X-Large.',
  'reason.required': 'Alasan pembatalan wajib diisi.',
})
