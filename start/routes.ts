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
    router.get('/masuk', [controllers.Session, 'create']).as('session.create')
    router.post('/masuk', [controllers.Session, 'store']).as('session.store')

    router.get('/staf/masuk', [controllers.Session, 'createStaff']).as('session.createStaff')
    router.post('/staf/masuk', [controllers.Session, 'storeStaff']).as('session.storeStaff')

    router.get('/daftar', [controllers.Registration, 'create']).as('register.create')
    router.post('/daftar', [controllers.Registration, 'store']).as('register.store')

    router.get('/verifikasi', [controllers.Otp, 'show']).as('otp.show')
    router.post('/verifikasi', [controllers.Otp, 'verify']).as('otp.verify')
    router.post('/verifikasi/kirim-ulang', [controllers.Otp, 'resend']).as('otp.resend')

    router
      .get('/lupa-kata-sandi', [controllers.PasswordReset, 'create'])
      .as('password_reset.create')
    router.post('/lupa-kata-sandi', [controllers.PasswordReset, 'store']).as('password_reset.store')

    router.get('/kata-sandi-baru', [controllers.PasswordReset, 'edit']).as('password_reset.edit')
    router
      .post('/kata-sandi-baru', [controllers.PasswordReset, 'update'])
      .as('password_reset.update')
  })
  .use(middleware.guest())

router
  .post('/keluar', [controllers.Session, 'destroy'])
  .as('session.destroy')
  .use(middleware.auth())

router
  .group(() => {
    router.on('/beranda').renderInertia('customer/dashboard', {}).as('customer.home')
  })
  .use(middleware.customer())

router
  .group(() => {
    router.on('/staf').renderInertia('staff/dashboard', {}).as('staff.home')
  })
  .use(middleware.staff())

router
  .group(() => {
    router.on('/admin').renderInertia('admin/dashboard', {}).as('admin.home')
  })
  .use(middleware.admin())

// Previews of the page templates and error pages that have no real page yet; never in production.
if (!app.inProduction) {
  router
    .group(() => {
      router.on('/alur').renderInertia('customer/flow_template_preview', {})
      router.on('/cetak').renderInertia('staff/print_template_preview', {})
      router.on('/404').renderInertia('errors/not_found', {})
      router.on('/500').renderInertia('errors/server_error', {})
      router.on('/og').renderInertia('og_image', {})
    })
    .prefix('/_preview')
}
