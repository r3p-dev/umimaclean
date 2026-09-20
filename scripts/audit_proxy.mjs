/**
 * A stand-in for Caddy, for local Lighthouse runs only.
 *
 * The Adonis static server compresses nothing and sends `Cache-Control:
 * max-age=0`, so auditing it directly understates the real score by roughly
 * eight points — `app.js` is 308 KB raw and 96 KB brotli, and that difference
 * lands squarely on First Contentful Paint.
 *
 * This proxies the production server and adds the two things Caddy will do:
 * brotli/gzip for text responses, and immutable caching for hashed assets.
 * It is a measurement tool, not part of the deployment.
 *
 *   node bin/server.js                 # in build/, NODE_ENV=production
 *   npm run audit:proxy                # then point Lighthouse at :3335
 */
import http from 'node:http'
import zlib from 'node:zlib'

const UPSTREAM = 'http://localhost:3334'
const TEXTY = /^(text\/|application\/(javascript|json|xml)|image\/svg)/

http.createServer((req, res) => {
  const proxied = http.request(`${UPSTREAM}${req.url}`, { method: req.method, headers: { ...req.headers, host: 'localhost:3334', 'accept-encoding': 'identity' } }, (up) => {
    const type = up.headers['content-type'] || ''
    const accepts = req.headers['accept-encoding'] || ''
    const headers = { ...up.headers }
    delete headers['content-length']

    if (/\/assets\/.*-[A-Za-z0-9_-]{8,}\./.test(req.url)) {
      headers['cache-control'] = 'public, max-age=31536000, immutable'
    }

    if (TEXTY.test(type) && /br/.test(accepts)) {
      headers['content-encoding'] = 'br'
      res.writeHead(up.statusCode, headers)
      up.pipe(zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })).pipe(res)
    } else if (TEXTY.test(type) && /gzip/.test(accepts)) {
      headers['content-encoding'] = 'gzip'
      res.writeHead(up.statusCode, headers)
      up.pipe(zlib.createGzip()).pipe(res)
    } else {
      res.writeHead(up.statusCode, headers)
      up.pipe(res)
    }
  })
  proxied.on('error', () => { res.writeHead(502); res.end() })
  req.pipe(proxied)
}).listen(3335, () => console.log('compressing proxy on 3335 -> 3334'))
