export const OtpPurpose = {
  REGISTER: 'register',
  RESET_PASSWORD: 'reset_password',
  CHANGE_PHONE: 'change_phone',
} as const

export type OtpPurpose = (typeof OtpPurpose)[keyof typeof OtpPurpose]

export const OtpPurposeLabel: Record<OtpPurpose, string> = {
  [OtpPurpose.REGISTER]: 'Pendaftaran',
  [OtpPurpose.RESET_PASSWORD]: 'Atur Ulang Kata Sandi',
  [OtpPurpose.CHANGE_PHONE]: 'Ganti Nomor WhatsApp',
}
