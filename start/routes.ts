import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home', {}).as('home')
router.on('/syarat').renderInertia('legal/terms', {}).as('legal.terms')
router.on('/privasi').renderInertia('legal/privacy', {}).as('legal.privacy')
router.get('/robots.txt', [controllers.Seo, 'robots'])
router.get('/sitemap.xml', [controllers.Seo, 'sitemap'])

router
  .group(() => {
    router.get('signup', [controllers.Register, 'create'])
    router.post('signup', [controllers.Register, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.on('/dashboard').renderInertia('customer/dashboard', {}).as('dashboard')
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())

// Previews of the page templates and error pages that have no real page yet; never in production.
if (!app.inProduction) {
  router
    .group(() => {
      router.on('/staf').renderInertia('staff/template_preview', {})
      router.on('/admin').renderInertia('admin/template_preview', {})
      router.on('/alur').renderInertia('customer/flow_template_preview', {})
      router.on('/cetak').renderInertia('staff/print_template_preview', {})
      router.on('/404').renderInertia('errors/not_found', {})
      router.on('/500').renderInertia('errors/server_error', {})
      router.on('/og').renderInertia('og_image', {})
    })
    .prefix('/_preview')
}
