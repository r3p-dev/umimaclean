import vine from '@vinejs/vine'
import { normalizePhone, phoneProblem, type PhoneProblem } from '#helpers/phone'

const RULES: Record<PhoneProblem, string> = {
  required: 'required',
  format: 'phoneDigits',
  prefix: 'phonePrefix',
  minLength: 'phoneTooShort',
  maxLength: 'phoneTooLong',
}

const phoneRule = vine.createRule((value, _options, field) => {
  if (typeof value !== 'string') {
    return
  }
  const problem = phoneProblem(value)
  if (problem) {
    field.report(RULES[problem], RULES[problem], field)
  }
})

export function phoneField() {
  return vine
    .string()
    .trim()
    .use(phoneRule())
    .transform((value) => normalizePhone(value) ?? value)
}
