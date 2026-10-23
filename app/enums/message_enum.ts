export const MessageStatus = {
  SENT: 'sent',
  FAILED: 'failed',
  LOGGED: 'logged',
} as const

export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus]
