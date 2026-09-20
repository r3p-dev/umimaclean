/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

/**
 * Public pages.
 *
 * Slugs are Indonesian and descriptive, never numeric ids, because the URL is
 * itself a ranking signal and the first thing a person reads in a search
 * result. Keep them stable: a changed slug is a lost page until the redirect
 * and the re-crawl catch up.
 */
router.get('/', [controllers.Public, 'home']).as('home')
router.get('/layanan', [controllers.Public, 'services']).as('services.index')
router.get('/layanan/:slug', [controllers.Public, 'service']).as('services.show')
router.get('/harga', [controllers.Public, 'pricing']).as('pricing')
router.get('/faq', [controllers.Public, 'faq']).as('faq')
router.get('/tentang', [controllers.Public, 'about']).as('about')
router.get('/kontak', [controllers.Public, 'contact']).as('contact')

/**
 * Coverage. `/area` is the hub; each page below it targets the words people
 * actually type — a place name, a campus — rather than an administrative unit.
 */
router.get('/area', [controllers.Public, 'areas']).as('areas.index')
router.get('/area/:slug', [controllers.Public, 'area']).as('areas.show')

/**
 * Ordering. The site is the front door: WhatsApp is for questions and
 * complaints, and a chat thread has to be read and transcribed by hand while a
 * form arrives structured and already checked against the coverage area.
 */
router.get('/pesan', [controllers.OrderRequest, 'create']).as('order.create')
router.post('/pesan', [controllers.OrderRequest, 'store']).as('order.store')

/**
 * Crawler endpoints. Routes, not static files, so the origin comes from
 * config and moving the domain stays a one-line change.
 */
router.get('/robots.txt', [controllers.Crawl, 'robots']).as('robots')
router.get('/sitemap.xml', [controllers.Crawl, 'sitemap']).as('sitemap')

/**
 * Authentication, as shipped by the starter kit. Phase 4 replaces the email
 * and password flow with an Indonesian phone number verified by OTP.
 */
router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())
