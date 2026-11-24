import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { areaCheckThrottle, placeThrottle } from '#start/limiter'

router.get('/', [controllers.Home, 'index']).as('home')
router.get('/area/cek', [controllers.AreaCheck, 'show']).as('area.check').use(areaCheckThrottle)
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

// Every OTP purpose: sign-up and password reset as a guest, phone change while signed in (CUST-13).
router.get('/verifikasi', [controllers.Otp, 'show']).as('otp.show')
router.post('/verifikasi', [controllers.Otp, 'verify']).as('otp.verify')
router.post('/verifikasi/kirim-ulang', [controllers.Otp, 'resend']).as('otp.resend')

router
  .group(() => {
    router.post('/keluar', [controllers.Session, 'destroy']).as('session.destroy')
    router
      .put('/akun/kata-sandi', [controllers.AccountSecurity, 'updatePassword'])
      .as('account_security.update_password')
    // Every signed-in role places pins: customers on addresses, staff on walk-in deliveries (AREA-4).
    router
      .get('/area/cek-titik', [controllers.AreaCheck, 'showPoint'])
      .as('area.check_point')
      .use(areaCheckThrottle)
    router.get('/tempat', [controllers.Places, 'index']).as('places.index').use(placeThrottle)
    router.get('/tempat/titik', [controllers.Places, 'show']).as('places.show').use(placeThrottle)
  })
  .use(middleware.auth())

router
  .group(() => {
    router.on('/beranda').renderInertia('customer/dashboard', {}).as('customer.home')
    router.get('/profil', [controllers.Profile, 'show']).as('customer.profile.show')
    router.get('/profil/ubah', [controllers.Profile, 'edit']).as('customer.profile.edit')
    router.put('/profil', [controllers.Profile, 'update']).as('customer.profile.update')
    router.get('/profil/nomor', [controllers.PhoneChange, 'edit']).as('customer.phone.edit')
    router.post('/profil/nomor', [controllers.PhoneChange, 'store']).as('customer.phone.store')
    router.get('/profil/alamat', [controllers.Addresses, 'index']).as('customer.addresses.index')
    router
      .get('/profil/alamat/baru', [controllers.Addresses, 'create'])
      .as('customer.addresses.create')
    router.post('/profil/alamat', [controllers.Addresses, 'store']).as('customer.addresses.store')
    router
      .group(() => {
        router
          .get('/profil/alamat/:id/ubah', [controllers.Addresses, 'edit'])
          .as('customer.addresses.edit')
        router
          .put('/profil/alamat/:id', [controllers.Addresses, 'update'])
          .as('customer.addresses.update')
        router
          .post('/profil/alamat/:id/utama', [controllers.Addresses, 'makePrimary'])
          .as('customer.addresses.primary')
        router
          .delete('/profil/alamat/:id', [controllers.Addresses, 'destroy'])
          .as('customer.addresses.destroy')
      })
      .where('id', router.matchers.number())
  })
  .use(middleware.customer())

router
  .group(() => {
    router.on('/staf').renderInertia('staff/dashboard', {}).as('staff.home')
    router.get('/staf/profil', [controllers.Profile, 'show']).as('staff.profile')
    router.get('/staf/profil/ubah', [controllers.Profile, 'edit']).as('staff.profile.edit')
    router.put('/staf/profil', [controllers.Profile, 'update']).as('staff.profile.update')
    router.get('/staf/profil/nomor', [controllers.PhoneChange, 'edit']).as('staff.phone.edit')
    router.post('/staf/profil/nomor', [controllers.PhoneChange, 'store']).as('staff.phone.store')
  })
  .use(middleware.staff())

router
  .group(() => {
    router.on('/admin').renderInertia('admin/dashboard', {}).as('admin.home')
    router.get('/admin/profil', [controllers.Profile, 'show']).as('admin.profile')
    router.get('/admin/profil/ubah', [controllers.Profile, 'edit']).as('admin.profile.edit')
    router.put('/admin/profil', [controllers.Profile, 'update']).as('admin.profile.update')
    router.get('/admin/profil/nomor', [controllers.PhoneChange, 'edit']).as('admin.phone.edit')
    router.post('/admin/profil/nomor', [controllers.PhoneChange, 'store']).as('admin.phone.store')
    router.get('/admin/layanan', [controllers.Services, 'index']).as('admin.services.index')
    router.post('/admin/layanan', [controllers.Services, 'store']).as('admin.services.store')
    router.put('/admin/layanan/:id', [controllers.Services, 'update']).as('admin.services.update')
    router
      .patch('/admin/layanan/:id/toggle', [controllers.Services, 'toggleActive'])
      .as('admin.services.toggle')
    router
      .post('/admin/layanan/bulk-toggle', [controllers.Services, 'bulkToggleActive'])
      .as('admin.services.bulk_toggle')
    router
      .delete('/admin/layanan/:id', [controllers.Services, 'destroy'])
      .as('admin.services.destroy')

    router
      .get('/admin/pengaturan', ({ response }) =>
        response.redirect().toRoute('admin.settings.store')
      )
      .as('admin.settings.index')
    router
      .get('/admin/pengaturan/toko', [controllers.StoreSettings, 'index'])
      .as('admin.settings.store')
    router
      .put('/admin/pengaturan/toko', [controllers.StoreSettings, 'update'])
      .as('admin.settings.store.update')
    router
      .get('/admin/pengaturan/slot', [controllers.PickupSlots, 'index'])
      .as('admin.settings.slots')
    router
      .put('/admin/pengaturan/slot/:weekday', [controllers.PickupSlots, 'update'])
      .where('weekday', router.matchers.number())
      .as('admin.settings.slots.update')
    router
      .post('/admin/pengaturan/slot/:weekday/salin', [controllers.PickupSlots, 'copy'])
      .where('weekday', router.matchers.number())
      .as('admin.settings.slots.copy')
    router
      .put('/admin/pengaturan/jam', [controllers.StoreSettings, 'updateHours'])
      .as('admin.settings.hours.update')

    router
      .get('/admin/pengaturan/area', [controllers.ServiceAreas, 'index'])
      .as('admin.areas.index')
    router
      .patch('/admin/pengaturan/area/:id/toggle', [controllers.ServiceAreas, 'toggleActive'])
      .as('admin.areas.toggle')
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
