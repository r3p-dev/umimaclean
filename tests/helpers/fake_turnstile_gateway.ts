import { errors } from '@vinejs/vine'

export const TEST_TURNSTILE_TOKEN = 'test-turnstile-token'

export class FakeTurnstileGateway {
  isEnabled(): boolean {
    return true
  }

  async verifyToken(token: unknown, _ip?: string): Promise<boolean> {
    return token === TEST_TURNSTILE_TOKEN
  }

  async assertToken(token: unknown, _ip?: string): Promise<void> {
    const isValid = await this.verifyToken(token)
    if (!isValid) {
      throw new errors.E_VALIDATION_ERROR([
        {
          field: 'turnstile',
          message: 'Selesaikan verifikasi keamanan, lalu coba lagi.',
          rule: 'turnstile',
        },
      ])
    }
  }
}

export const fakeTurnstile = new FakeTurnstileGateway()
