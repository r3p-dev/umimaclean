import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'
import { throttleAreaCheck } from '#start/limiter'

import '#start/routes/auth'
import '#start/routes/customer'
import '#start/routes/staff'
import '#start/routes/admin'

router.get('/', [controllers.Home, 'show']).as('home')
router.get('/syarat', [controllers.Legal, 'terms']).as('legal.terms')
router.get('/privasi', [controllers.Legal, 'privacy']).as('legal.privacy')
router.get('/sitemap.xml', [controllers.Seo, 'sitemap']).as('seo.sitemap')
router.get('/robots.txt', [controllers.Seo, 'robots']).as('seo.robots')
router.get('/area', [controllers.shared.Areas, 'show']).as('area.check').use(throttleAreaCheck)

router
  .post('/webhooks/midtrans', [controllers.shared.PaymentNotifications, 'store'])
  .as('webhooks.midtrans')

router
  .get('/foto-bukti/:id', [controllers.shared.ProofPhotos, 'show'])
  .as('photos.show')
  .use(middleware.auth())
