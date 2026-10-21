import type { OtpPurpose } from '@enums/otp_enum'

export const OTP_LENGTH = 6

export const OTP_SCREEN: Record<
  OtpPurpose,
  {
    title: string
    submit: string
    restart: 'auth.register' | 'auth.password.forgot' | 'customer.phone.edit'
  }
> = {
  register: {
    title: 'Verifikasi nomor WhatsApp',
    submit: 'Verifikasi & Buat Akun',
    restart: 'auth.register',
  },
  reset_password: {
    title: 'Masukkan kode verifikasi',
    submit: 'Verifikasi',
    restart: 'auth.password.forgot',
  },
  change_phone: {
    title: 'Verifikasi nomor baru',
    submit: 'Verifikasi & Ganti Nomor',
    restart: 'customer.phone.edit',
  },
}
