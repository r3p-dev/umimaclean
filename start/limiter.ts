import limiter from '@adonisjs/limiter/services/main'

// The coverage checks (the public name check and the signed-in pin check): 60 per minute per IP,
// generous because mobile carriers share IPs (D80, D109).
export const areaCheckThrottle = limiter.define('areaCheck', (ctx) => {
  return limiter
    .allowRequests(60)
    .every('1 minute')
    .usingKey(`area_check_${ctx.request.ip()}`)
    .limitExceeded((error) => {
      error.setMessage(
        `Terlalu banyak pengecekan. Coba lagi dalam ${error.response.availableIn} detik.`
      )
    })
})
