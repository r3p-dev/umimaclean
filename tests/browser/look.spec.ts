import { test } from '@japa/runner'
import { AxeBuilder } from '@axe-core/playwright'

const PAGES = [
  '/',
  '/syarat',
  '/privasi',
  '/login',
  '/signup',
  '/_preview/staf',
  '/_preview/admin',
  '/_preview/alur',
  '/_preview/cetak',
  '/_preview/404',
  '/_preview/500',
]

test.group('Look and feel', () => {
  test('{$self} loads nothing from another host, in Indonesian, with one main heading')
    .with(PAGES)
    .run(async ({ visit, browserContext, assert }, path) => {
      const outsideRequests: string[] = []
      await browserContext.route('**/*', (route) => {
        const url = new URL(route.request().url())
        if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
          outsideRequests.push(url.href)
          return route.abort()
        }
        return route.continue()
      })

      const page = await visit(path)
      await page.waitForLoadState('networkidle')

      assert.deepEqual(outsideRequests, [])
      assert.equal(await page.locator('html').getAttribute('lang'), 'id')
      assert.equal(await page.locator('h1').count(), path === '/_preview/cetak' ? 0 : 1)
    })

  test('stays light when the device prefers a dark theme', async ({ visit, assert }) => {
    const page = await visit('/')
    const background = 'getComputedStyle(document.body).backgroundColor'
    const lightBackground = await page.evaluate(background)

    await page.emulateMedia({ colorScheme: 'dark' })

    assert.equal(await page.evaluate(background), lightBackground)
  })

  test('the first Tab press shows a visible focus ring', async ({ visit, assert }) => {
    const page = await visit('/login')
    await page.waitForLoadState('networkidle')
    await page.keyboard.press('Tab')

    const focused = await page.evaluate(`(() => {
      const style = getComputedStyle(document.activeElement)
      return { tag: document.activeElement.tagName, width: style.outlineWidth, shadow: style.boxShadow }
    })()`)
    assert.properties(focused, ['tag', 'width', 'shadow'])
    const { tag, width, shadow } = focused as { tag: string; width: string; shadow: string }
    assert.equal(tag, 'A')
    assert.isTrue(width !== '0px' || shadow !== 'none')
  })

  test('{$self} has no WCAG 2.1 AA violations (axe)')
    .with(['/', '/syarat', '/privasi', '/login', '/signup', '/_preview/404', '/_preview/500'])
    .run(async ({ visit, assert }, path) => {
      const page = await visit(path)
      await page.waitForLoadState('networkidle')

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      const violations = results.violations.map(
        (violation) => `${violation.id}: ${violation.nodes.map((node) => node.target).join(' | ')}`
      )
      assert.deepEqual(violations, [])
    })

  test('{$self} does not scroll sideways at 360 px')
    .with(PAGES)
    .run(async ({ visit, assert }, path) => {
      const page = await visit(path)
      await page.setViewportSize({ width: 360, height: 780 })
      await page.waitForLoadState('networkidle')

      assert.isAtMost(Number(await page.evaluate('document.documentElement.scrollWidth')), 360)
    })

  test('the before and after slider moves with the keyboard', async ({ visit, assert }) => {
    const page = await visit('/')
    const slider = page.getByRole('slider', { name: /membandingkan sebelum dan sesudah/ })
    await slider.focus()
    await page.keyboard.press('ArrowRight')

    assert.equal(await slider.inputValue(), '51')
  })
})
