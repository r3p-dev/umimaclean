export const OtpPurpose = {
  REGISTER: 'register',
  RESET_PASSWORD: 'reset_password',
  CHANGE_PHONE: 'change_phone',
} as const

export type OtpPurpose = (typeof OtpPurpose)[keyof typeof OtpPurpose]
