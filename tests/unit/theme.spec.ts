import { readdir, readFile } from 'node:fs/promises'
import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'

test.group('One light theme', () => {
  test('the shadcn components carry no dark: classes', async ({ assert }) => {
    const folder = app.makePath('inertia/components/ui')
    for (const file of await readdir(folder)) {
      const source = await readFile(`${folder}/${file}`, 'utf8')
      assert.notMatch(source, /(?<![\w-])dark:/, `${file} has a dark: class`)
    }
  })

  test('app.css defines no dark theme', async ({ assert }) => {
    const css = await readFile(app.makePath('inertia/css/app.css'), 'utf8')
    assert.notMatch(css, /\.dark\b|prefers-color-scheme|@custom-variant dark/)
  })
})
