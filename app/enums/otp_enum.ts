export const OtpPurpose = {
  REGISTER: 'register',
  RESET_PASSWORD: 'reset_password',
  CHANGE_PHONE: 'change_phone',
} as const

export const OtpPurposeLabel = {
  [OtpPurpose.REGISTER]: 'Daftar akun',
  [OtpPurpose.RESET_PASSWORD]: 'Atur ulang kata sandi',
  [OtpPurpose.CHANGE_PHONE]: 'Ganti nomor WhatsApp',
} as const

export type OtpPurpose = (typeof OtpPurpose)[keyof typeof OtpPurpose]
