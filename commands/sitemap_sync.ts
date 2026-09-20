import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Reconcile `content_pages` with the pages the code currently defines.
 *
 * Belongs in the deploy step immediately after `migration:run`. Pages whose
 * content is unchanged keep their existing `updated_at`, which is the whole
 * point: the sitemap's `lastmod` should say when the page changed, not when we
 * last deployed.
 */
export default class SitemapSync extends BaseCommand {
  static commandName = 'sitemap:sync'
  static description = 'Sync the sitemap content table with the pages defined in code'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { syncContentPages } = await import('#seo/sitemap')
    const result = await syncContentPages()

    this.logger.info(
      `sitemap: ${result.created} created, ${result.updated} updated, ` +
        `${result.untouched} unchanged, ${result.removed} removed`
    )
  }
}
