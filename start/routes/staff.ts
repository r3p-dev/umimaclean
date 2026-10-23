import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'

router
  .group(() => {
    router.get('/', [controllers.staff.Dashboard, 'home']).as('home')
    router.get('/jemput', [controllers.staff.Tasks, 'pickups']).as('pickups')
    router.get('/jemput/tugas', [controllers.staff.Tasks, 'pickupTask']).as('pickup_task')
    router.get('/antar', [controllers.staff.Tasks, 'deliveries']).as('deliveries')
    router.get('/antar/tugas', [controllers.staff.Tasks, 'deliveryTask']).as('delivery_task')
    router
      .group(() => {
        router.post('/mulai', [controllers.staff.Tasks, 'start']).as('start')
        router.post('/tiba', [controllers.staff.Tasks, 'arrive']).as('arrive')
        router.post('/selesai', [controllers.staff.Tasks, 'complete']).as('complete')
        router.post('/lewati', [controllers.staff.Tasks, 'skip']).as('skip')
      })
      .prefix('/:kind/:code')
      .where('kind', /^(jemput|antar)$/)
      .as('task')
    router.get('/proses', [controllers.staff.Process, 'queue']).as('process')
    router
      .get('/proses/:number/periksa', [controllers.staff.Process, 'inspection'])
      .as('inspection')
    router.get('/proses/:number/cuci', [controllers.staff.Process, 'washing']).as('washing')
    router
      .post('/proses/:number/periksa/mulai', [controllers.staff.Process, 'startInspection'])
      .as('inspection.start')
    router
      .post('/proses/:number/periksa', [controllers.staff.Process, 'saveInspection'])
      .as('inspection.save')
    router
      .post('/proses/:number/cuci', [controllers.staff.Process, 'completeWash'])
      .as('washing.complete')
    router.post('/proses/:number/serahkan', [controllers.staff.Process, 'collect']).as('collect')
    router.get('/lainnya', [controllers.staff.Dashboard, 'more']).as('more')
    router.get('/transaksi', [controllers.staff.Store, 'walkIn']).as('walk_in')
    router.post('/transaksi', [controllers.staff.Store, 'store']).as('walk_in.store')
    router.get('/transaksi/:number/bayar', [controllers.staff.Store, 'payment']).as('store_payment')
    router
      .post('/transaksi/:number/bayar', [controllers.staff.Store, 'recordPayment'])
      .as('store_payment.record')
    router
      .post('/transaksi/:number/qris', [controllers.staff.Store, 'startQris'])
      .as('store_payment.qris')
    router
      .post('/transaksi/:number/qris/cek', [controllers.staff.Store, 'checkQris'])
      .as('store_payment.qris_check')
    router
      .post('/transaksi/:number/struk', [controllers.staff.Store, 'sendReceipt'])
      .as('store_payment.receipt')
    router
      .post('/transaksi/:number/foto', [controllers.staff.Store, 'storePhotos'])
      .as('walk_in.photos')
    router.get('/foto', [controllers.staff.Store, 'photo']).as('photo')
    router.get('/riwayat', [controllers.staff.Account, 'history']).as('history')
    router.get('/profil', [controllers.staff.Account, 'profile']).as('profile')
    router
      .put('/profil/kata-sandi', [controllers.shared.AccountSecurity, 'updatePassword'])
      .as('password.update')
    router
      .post('/profil/keluar-perangkat-lain', [controllers.shared.AccountSecurity, 'signOutOthers'])
      .as('sign_out_others')
  })
  .prefix('/staf')
  .use([middleware.auth({ loginRoute: '/staf/masuk' }), middleware.area('staff')])
  .as('staff')
