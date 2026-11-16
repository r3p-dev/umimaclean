import { errors } from '@vinejs/vine'

// Runs an action that must fail with a VineJS validation error and returns its field messages.
export async function validationMessagesOf(action: () => Promise<unknown>) {
  try {
    await action()
  } catch (error) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      return error.messages as { field: string; message: string; rule: string }[]
    }
    throw error
  }
  throw new Error('Expected a validation error, but the action succeeded')
}
