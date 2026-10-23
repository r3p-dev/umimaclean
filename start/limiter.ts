import limiter from '@adonisjs/limiter/services/main'

export const throttleAreaCheck = limiter.define('area_check', (ctx) => {
  return limiter.allowRequests(60).every('1 minute').usingKey(`area_check_${ctx.request.ip()}`)
})
