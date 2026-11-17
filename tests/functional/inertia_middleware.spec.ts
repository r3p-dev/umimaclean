import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import SettingService, { type StoreInfoSetting } from '#services/setting_service'

class UnreadableSettings extends SettingService {
  override async getStoreSettings(): Promise<StoreInfoSetting> {
    throw new Error('relation "settings" does not exist')
  }
}

test.group('Shared page props', (group) => {
  group.each.teardown(() => app.container.restore(SettingService))

  test('a database error while reading the store settings fails the page in tests instead of being hidden', async ({
    client,
  }) => {
    app.container.swap(SettingService, () => new UnreadableSettings())

    const response = await client.get('/')
    response.assertStatus(500)
  })
})
