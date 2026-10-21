import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

router
  .group(() => {
    router.get('/masuk', [controllers.auth.Session, 'create']).as('login')
    router.post('/masuk', [controllers.auth.Session, 'store']).as('login.store')

    router.get('/daftar', [controllers.auth.Register, 'create']).as('register')
    router.post('/daftar', [controllers.auth.Register, 'store']).as('register.store')

    router.get('/lupa-kata-sandi', [controllers.auth.PasswordReset, 'create']).as('password.forgot')
    router
      .post('/lupa-kata-sandi', [controllers.auth.PasswordReset, 'store'])
      .as('password.forgot.store')

    router.get('/kata-sandi-baru', [controllers.auth.PasswordReset, 'edit']).as('password.reset')
    router
      .put('/kata-sandi-baru', [controllers.auth.PasswordReset, 'update'])
      .as('password.reset.update')

    router.get('/staf/masuk', [controllers.auth.StaffSession, 'create']).as('staff_login')
    router.post('/staf/masuk', [controllers.auth.StaffSession, 'store']).as('staff_login.store')
  })
  .use(middleware.guest())
  .as('auth')

router
  .group(() => {
    router.get('/verifikasi', [controllers.auth.Otp, 'show']).as('otp')
    router.post('/verifikasi', [controllers.auth.Otp, 'verify']).as('otp.verify')
    router.post('/verifikasi/kirim-ulang', [controllers.auth.Otp, 'resend']).as('otp.resend')

    router
      .post('/keluar', [controllers.auth.Session, 'destroy'])
      .as('logout')
      .use(middleware.auth())
  })
  .as('auth')
