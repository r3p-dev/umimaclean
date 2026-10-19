import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home', {}).as('home')

router.on('/pesan').renderInertia('customer/order/details', {}).as('order.details')
router.on('/pesan/barang').renderInertia('customer/order/items', {}).as('order.items')
router.on('/pesan/konfirmasi').renderInertia('customer/order/confirm', {}).as('order.confirm')
router.on('/pesan/dibuat').renderInertia('customer/order/created', {}).as('order.created')

router.on('/lacak').renderInertia('customer/tracking/sign_in', {}).as('tracking.sign_in')
router.on('/pesanan').renderInertia('customer/tracking/orders', {}).as('tracking.orders')
router
  .get('/pesanan/:number', ({ inertia, params }) =>
    inertia.render('customer/tracking/status', { number: params.number })
  )
  .as('tracking.status')
router
  .get('/pesanan/:number/tagihan', ({ inertia, params }) =>
    inertia.render('customer/payment/bill', { number: params.number })
  )
  .as('payment.bill')
router
  .get('/pesanan/:number/bayar', ({ inertia, params }) =>
    inertia.render('customer/payment/qris', { number: params.number })
  )
  .as('payment.qris')

router
  .group(() => {
    router.on('/').renderInertia('staff/home', {}).as('home')
    router
      .get('/jemput', ({ inertia }) => inertia.render('staff/tasks/queue', { kind: 'jemput' }))
      .as('pickups')
    router
      .get('/jemput/tugas', ({ inertia }) =>
        inertia.render('staff/tasks/active', { kind: 'jemput' })
      )
      .as('pickup_task')
    router
      .get('/antar', ({ inertia }) => inertia.render('staff/tasks/queue', { kind: 'antar' }))
      .as('deliveries')
    router
      .get('/antar/tugas', ({ inertia }) => inertia.render('staff/tasks/active', { kind: 'antar' }))
      .as('delivery_task')
    router.on('/proses').renderInertia('staff/process/queue', {}).as('process')
    router
      .get('/proses/:number/periksa', ({ inertia, params }) =>
        inertia.render('staff/process/inspection', { number: params.number })
      )
      .as('inspection')
    router
      .get('/proses/:number/cuci', ({ inertia, params }) =>
        inertia.render('staff/process/washing', { number: params.number })
      )
      .as('washing')
    router.on('/lainnya').renderInertia('staff/more', {}).as('more')
    router.on('/transaksi').renderInertia('staff/store/walk_in', {}).as('walk_in')
    router
      .get('/transaksi/:number/bayar', ({ inertia, params }) =>
        inertia.render('staff/store/payment', { number: params.number })
      )
      .as('store_payment')
    router
      .get('/foto', ({ inertia, request }) =>
        inertia.render('staff/store/photo', {
          kind: String(request.qs().untuk ?? 'intake'),
          number: String(request.qs().pesanan ?? ''),
        })
      )
      .as('photo')
    router.on('/riwayat').renderInertia('staff/account/history', {}).as('history')
    router.on('/profil').renderInertia('staff/account/profile', {}).as('profile')
  })
  .prefix('/staf')
  .as('staff')

router
  .group(() => {
    router.on('/').renderInertia('admin/summary', {}).as('summary')
    router.on('/pelanggan').renderInertia('admin/customers', {}).as('customers')
    router.on('/aktivitas').renderInertia('admin/activity', {}).as('activity')
    router.on('/pesanan').renderInertia('admin/orders/list', {}).as('orders')
    router
      .get('/pesanan/:number', ({ inertia, params }) =>
        inertia.render('admin/orders/detail', { number: params.number })
      )
      .as('order')
    router.on('/layanan').renderInertia('admin/services', {}).as('services')
    router.on('/laporan').renderInertia('admin/reports', {}).as('reports')
    router.on('/pengaturan').renderInertia('admin/settings/staff', {}).as('staff')
    router.on('/pengaturan/toko').renderInertia('admin/settings/store', {}).as('store')
  })
  .prefix('/admin')
  .as('admin')
