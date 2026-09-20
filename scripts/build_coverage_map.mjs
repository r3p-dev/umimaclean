/**
 * Build the coverage map, once, at author time. Committed output; no runtime
 * geometry, no Overpass, no map library on any public page.
 *
 *   npm run build:map
 *
 * SOURCE — Badan Informasi Geospasial (BIG), the Indonesian national mapping
 * agency: RBI 1:10.000 `Administrasi_AR_Kecamatan_10K`.
 *
 * OpenStreetMap was tried first and cannot supply this. Kecamatan boundaries
 * for Kota Cimahi and most of Kabupaten Bandung simply are not in OSM — not
 * mis-tagged, absent. Baleendah exists only as a `place=town` node, and
 * Cimahi Tengah has no boundary relation at all. Verified against the local
 * extract, the public Overpass API by bbox, by name across admin levels, and
 * Nominatim. A map built from OSM would draw thirteen covered kecamatan as
 * uncovered.
 *
 * GADM is deliberately not used: its licence forbids commercial use, and this
 * is a commercial site.
 *
 * NAME MATCHING is where this fails, not geometry. BIG writes "Astana Anyar"
 * where the official spelling is "Astanaanyar", and names collide across
 * provinces — there is a Soreang in Sulawesi Selatan and a Pameungpeuk in
 * Garut. So features are filtered by province and regency first, then matched
 * on a normalised key, and the script exits non-zero naming any covered
 * kecamatan it could not find. Silence is how Cimahi vanished last time.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { COVERED_KECAMATAN, NOT_COVERED_KECAMATAN, MAP_NEIGHBOURS } from '#content/areas'

const SERVICE =
  'https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/Administrasi_AR_Kecamatan_10K/MapServer/0/query'

/** The regencies and cities whose kecamatan make up the map. */
const REGENCIES = ['Kota Bandung', 'Kota Cimahi', 'Bandung', 'Bandung Barat']

/** Casefold and strip everything that varies between spellings. */
function normalise(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '')
}

/** ---- Fetch every kecamatan in the four units, with geometry ---- */
async function fetchBoundaries() {
  /**
   * Cache the response. This is a national mapping agency's service, not a
   * CDN, and iterating on the SVG should not mean re-downloading 80 polygons
   * each time. Pass --refresh to bypass.
   */
  const cache = join(tmpdir(), 'umimaclean-big-kecamatan.json')
  if (!process.argv.includes('--refresh') && existsSync(cache)) {
    console.log('using cached BIG response (pass --refresh to re-fetch)')
    return JSON.parse(readFileSync(cache, 'utf8'))
  }

  const where = `WADMPR='Jawa Barat' AND WADMKK IN (${REGENCIES.map((r) => `'${r}'`).join(',')})`

  const params = new URLSearchParams({
    where,
    outFields: 'WADMKC,WADMKK',
    returnGeometry: 'true',
    outSR: '4326',
    /** Server-side generalisation: ~11 m, far finer than this map renders */
    maxAllowableOffset: '0.0001',
    geometryPrecision: '5',
    f: 'geojson',
  })

  const response = await fetch(`${SERVICE}?${params}`, {
    headers: { 'user-agent': 'umimaclean-coverage-map/1.0 (r3p.dev@gmail.com)' },
  })

  if (!response.ok) {
    throw new Error(`BIG service returned ${response.status}`)
  }

  const collection = await response.json()
  if (!collection.features?.length) {
    throw new Error('BIG service returned no features')
  }

  writeFileSync(cache, JSON.stringify(collection))

  return collection
}

/** ---- Match BIG's spellings to ours, loudly ---- */
function classify(collection) {
  const covered = new Map(COVERED_KECAMATAN.map((name) => [normalise(name), name]))
  const neighbours = new Map(MAP_NEIGHBOURS.map((name) => [normalise(name), name]))

  const matchedCovered = new Set()
  const matchedNeighbours = new Set()
  const features = []

  for (const feature of collection.features) {
    const source = feature.properties.WADMKC
    const key = normalise(source)

    /**
     * Output always uses our official spelling, never BIG's, so the map, the
     * lists, and the schema all say the same word.
     */
    let name = covered.get(key)
    let role = 'covered'

    if (name) {
      matchedCovered.add(name)
    } else {
      name = neighbours.get(key)
      if (name) {
        role = 'neighbour'
        matchedNeighbours.add(name)
      } else {
        name = source
        role = 'other'
      }
    }

    features.push({
      type: 'Feature',
      properties: { name, role, source },
      geometry: feature.geometry,
    })
  }

  /** The whole point of this script: fail loudly rather than draw a lie */
  const missing = COVERED_KECAMATAN.filter((name) => !matchedCovered.has(name))
  if (missing.length > 0) {
    console.error(`\n${missing.length} covered kecamatan had no boundary in the source data:\n`)
    for (const name of missing) console.error(`  - ${name}`)
    console.error('\nRefusing to build a map that would draw these as uncovered.\n')
    process.exit(1)
  }

  const missingNeighbours = MAP_NEIGHBOURS.filter((name) => !matchedNeighbours.has(name))
  if (missingNeighbours.length > 0) {
    console.warn(`note: no boundary found for ${missingNeighbours.join(', ')}`)
  }

  return { type: 'FeatureCollection', features }
}

/**
 * The frame is the covered area plus a margin — never the extent of the source
 * data. Nobody wants to look at an entire kabupaten to find out whether their
 * kecamatan is served, and the surrounding bulk is most of the byte budget.
 *
 * Uncovered polygons are cut at the frame rather than dropped, so the map reads
 * as continuing past its edge, which is what a map should do.
 */
function coverageFrame(collection, padding = Number(process.env.PADDING ?? 0.12)) {
  let minLon = Infinity
  let maxLon = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  for (const feature of collection.features) {
    if (feature.properties.role !== 'covered') continue

    const polygons =
      feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates

    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (const [lon, lat] of ring) {
          if (lon < minLon) minLon = lon
          if (lon > maxLon) maxLon = lon
          if (lat < minLat) minLat = lat
          if (lat > maxLat) maxLat = lat
        }
      }
    }
  }

  const padX = (maxLon - minLon) * padding
  const padY = (maxLat - minLat) * padding

  return [minLon - padX, minLat - padY, maxLon + padX, maxLat + padY]
}

/** ---- Simplify with mapshaper, which keeps shared borders consistent ---- */
function simplify(collection, frame) {
  const dir = mkdtempSync(join(tmpdir(), 'coverage-'))
  const input = join(dir, 'in.json')
  writeFileSync(input, JSON.stringify(collection))

  /**
   * mapshaper returns a FeatureCollection normally, but a bare
   * GeometryCollection once `-dissolve` has stripped every property. Normalise
   * both to a features array so the caller does not have to care.
   */
  const run = (args, out) => {
    execFileSync('npx', ['mapshaper', input, ...args, '-o', out], { stdio: 'pipe' })
    const parsed = JSON.parse(readFileSync(out, 'utf8'))

    if (parsed.features) return parsed.features
    if (parsed.geometries) {
      return parsed.geometries.map((geometry) => ({ type: 'Feature', properties: {}, geometry }))
    }

    return []
  }

  /**
   * Identical simplify settings in both passes, applied before filtering, so
   * the shared borders of covered and uncovered areas stay aligned. Simplifying
   * each subset independently opens slivers between neighbours.
   */
  const percent = process.env.SIMPLIFY ?? '3%'
  /**
   * `keep-shapes` stays on: it guarantees no polygon is simplified out of
   * existence. Relative path encoding bought enough headroom that there is no
   * longer any reason to trade that safety for bytes.
   */
  const keepShapes = process.env.KEEP_SHAPES === '0' ? [] : ['keep-shapes']

  /**
   * Clip before simplifying, so the vertex budget is spent on geometry that
   * is actually visible.
   */
  const simplifyArgs = [
    '-clip',
    `bbox=${frame.join(',')}`,
    '-simplify',
    'visvalingam',
    percent,
    ...keepShapes,
  ]

  const shapes = run([...simplifyArgs, '-filter', 'role !== "other"'], join(dir, 'shapes.json'))
  const background = run(
    [...simplifyArgs, '-filter', 'role === "other"', '-dissolve'],
    join(dir, 'bg.json')
  )

  return { shapes, background }
}

/** ---- Project to SVG user space ---- */
function project(featureLists) {
  const all = featureLists.flat()

  let minLon = Infinity
  let maxLon = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  const eachRing = (geometry, visit) => {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
    for (const polygon of polygons) for (const ring of polygon) visit(ring)
  }

  for (const feature of all) {
    eachRing(feature.geometry, (ring) => {
      for (const [lon, lat] of ring) {
        if (lon < minLon) minLon = lon
        if (lon > maxLon) maxLon = lon
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
      }
    })
  }

  /**
   * Equirectangular with the longitude axis scaled by cos(latitude). Over an
   * area this small that is visually identical to a proper projection and
   * costs nothing.
   */
  const midLat = ((minLat + maxLat) / 2) * (Math.PI / 180)
  const lonScale = Math.cos(midLat)

  /**
   * The viewBox width sets the effective resolution, because coordinates are
   * integers. Cropping to the coverage frame shrank the ground covered, so a
   * fixed 1000 units would have quietly tripled the precision — and the byte
   * count — for detail no one can see. 600 units across the frame is roughly
   * one unit per rendered pixel.
   */
  const width = Number(process.env.VIEW_WIDTH ?? 800)
  const spanX = (maxLon - minLon) * lonScale
  const spanY = maxLat - minLat
  const height = Math.round((spanY / spanX) * width)

  /**
   * Integer user units. The viewBox is 1000 wide across roughly 72 km, so one
   * unit is about 72 m — and the map renders at some 600 px, where a single
   * pixel already covers 120 m. A decimal place here is precision no one can
   * see, paid for in bytes on every page view. mapshaper kept the topology, so
   * both sides of a shared border round to the same value and no gaps open up.
   */
  const precision = Number(process.env.PRECISION ?? 0)

  /**
   * Relative path data, one `l` command per ring.
   *
   * Absolute coordinates in a 450-unit viewBox are mostly three digits each;
   * the step between adjacent vertices is usually one or two. Encoding deltas
   * cuts the path data by roughly a third with no geometric loss whatsoever —
   * far better than buying the same bytes by lowering the resolution, which
   * costs real shape fidelity. A single `l` takes every pair after the opening
   * `M`, so the command letters disappear too.
   */
  const toPath = (geometry) => {
    const parts = []

    eachRing(geometry, (ring) => {
      const points = []
      let previous = null

      for (const [lon, lat] of ring) {
        const x = Math.round(((lon - minLon) * lonScale * width) / spanX)
        const y = Math.round(height - ((lat - minLat) * height) / spanY)

        /** Rounding collapses neighbouring vertices; drop the repeats */
        if (!previous || x !== previous[0] || y !== previous[1]) {
          points.push([x, y])
          previous = [x, y]
        }
      }

      /** Z closes the ring, so an explicit return to the start is dead weight */
      const first = points[0]
      const last = points[points.length - 1]
      if (points.length > 1 && first[0] === last[0] && first[1] === last[1]) {
        points.pop()
      }

      if (points.length < 3) return

      const deltas = []
      for (let i = 1; i < points.length; i += 1) {
        deltas.push(`${points[i][0] - points[i - 1][0]},${points[i][1] - points[i - 1][1]}`)
      }

      parts.push(`M${first[0]},${first[1]}l${deltas.join(' ')}Z`)
    })

    return parts.join('')
  }

  return { width, height, toPath }
}

/** ---- Emit ---- */
const collection = await fetchBoundaries()
console.log(`fetched ${collection.features.length} kecamatan from BIG`)

const classified = classify(collection)
const frame = coverageFrame(classified)
const { shapes, background } = simplify(classified, frame)
const { width, height, toPath } = project([shapes, background])

/**
 * The name-matching guard runs before simplification, so it cannot catch a
 * kecamatan that mapshaper removed. Check again on the way out: a covered area
 * that made it into the data but not onto the map is the same lie, arrived at
 * one step later.
 */
const drawnCovered = new Set(
  shapes.filter((f) => f.properties.role === 'covered').map((f) => f.properties.name)
)
const lost = COVERED_KECAMATAN.filter((name) => !drawnCovered.has(name))
if (lost.length > 0) {
  console.error(`\n${lost.length} covered kecamatan were simplified out of the map:\n`)
  for (const name of lost) console.error(`  - ${name}`)
  console.error('\nLower SIMPLIFY or re-enable keep-shapes.\n')
  process.exit(1)
}

const covered = shapes
  .filter((f) => f.properties.role === 'covered')
  .map((f) => ({ name: f.properties.name, d: toPath(f.geometry) }))
  .sort((a, b) => a.name.localeCompare(b.name))

const neighbours = shapes
  .filter((f) => f.properties.role === 'neighbour')
  .map((f) => ({ name: f.properties.name, d: toPath(f.geometry) }))
  .sort((a, b) => a.name.localeCompare(b.name))

const backgroundPath = background.map((f) => toPath(f.geometry)).join('')

const module = `/**
 * GENERATED FILE — do not edit by hand. Run \`npm run build:map\`.
 *
 * Source: Badan Informasi Geospasial (BIG), RBI 1:10.000 kecamatan boundaries.
 * Simplified with mapshaper (visvalingam 3%, shared borders kept aligned) and
 * projected to SVG user space. Coverage flags come from app/content/areas.ts,
 * never from the geometry.
 */

export type CoverageShape = { name: string; d: string }

export const COVERAGE_MAP = {
  width: ${width},
  height: ${height},
  /** Every surrounding kecamatan, dissolved into one path. */
  background: ${JSON.stringify(backgroundPath)},
  /** Kept individually so "is Padalarang covered?" is answerable on hover. */
  neighbours: ${JSON.stringify(neighbours)} as readonly CoverageShape[],
  covered: ${JSON.stringify(covered)} as readonly CoverageShape[],
} as const
`

writeFileSync('app/content/coverage_map.ts', module)

writeFileSync(
  'resources/geo/coverage-source.json',
  `${JSON.stringify(
    {
      source: 'Badan Informasi Geospasial (BIG), RBI 1:10.000 Administrasi_AR_Kecamatan_10K',
      service: SERVICE,
      retrieved: new Date().toISOString().slice(0, 10),
      regencies: REGENCIES,
      matched: {
        covered: covered.map((s) => s.name),
        neighbours: neighbours.map((s) => s.name),
      },
      /** BIG's spelling next to ours, so a future mismatch is auditable. */
      spellingDifferences: classified.features
        .filter((f) => f.properties.role !== 'other' && f.properties.source !== f.properties.name)
        .map((f) => ({ big: f.properties.source, official: f.properties.name }))
        .sort((a, b) => a.official.localeCompare(b.official)),
    },
    null,
    2
  )}\n`
)

/**
 * What matters is the geometry that reaches the document, not the TypeScript
 * wrapped around it. Budget is 20 KB.
 */
const pathBytes =
  Buffer.byteLength(backgroundPath) +
  [...covered, ...neighbours].reduce((total, shape) => total + Buffer.byteLength(shape.d), 0)

const textOnly = NOT_COVERED_KECAMATAN.filter(
  (name) => !neighbours.some((shape) => shape.name === name)
)

console.log(
  `covered ${covered.length}, neighbours ${neighbours.length}, ` +
    `viewBox ${width}x${height}, path data ${(pathBytes / 1024).toFixed(1)} KB, ` +
    `module ${(Buffer.byteLength(module) / 1024).toFixed(1)} KB`
)

if (textOnly.length > 0) {
  console.log(`listed as out of area in text only: ${textOnly.join(', ')}`)
}

if (pathBytes > 20 * 1024) {
  console.error(`\npath data is ${(pathBytes / 1024).toFixed(1)} KB, over the 20 KB budget.`)
  console.error('Raise SIMPLIFY (e.g. SIMPLIFY=0.5% npm run build:map).\n')
  process.exit(1)
}
