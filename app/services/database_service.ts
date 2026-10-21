import type { TransactionClientContract } from '@adonisjs/lucid/types/database'

export function isUniqueViolation(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false
  }

  return String(error.code) === '23505'
}

export function afterCommit(
  transaction: TransactionClientContract | undefined,
  callback: () => unknown
) {
  if (transaction) {
    transaction.after('commit', async () => {
      await callback()
    })
    return
  }

  void callback()
}
