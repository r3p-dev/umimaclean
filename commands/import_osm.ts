import { spawn } from 'node:child_process'
import { createWriteStream, existsSync } from 'node:fs'
import { mkdir, readFile, rename } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import type { ReadableStream } from 'node:stream/web'
import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import ServiceArea from '#models/service_area'
import env from '#start/env'

const SOURCE_URL = 'https://download.geofabrik.de/asia/indonesia/java-latest.osm.pbf'
export const CLIP_BOUNDS = { west: 107.05, south: -7.45, east: 108.05, north: -6.55 }

export default class ImportOsm extends BaseCommand {
  static override commandName = 'osm:import'
  static override description =
    'Download the Java OSM extract, clip it to Bandung Raya and load it into the osm schema'
  static override options: CommandOptions = { startApp: true }

  @flags.boolean({ description: 'Download the Java extract again' })
  declare refresh?: boolean

  override async run() {
    const directory = app.makePath('storage/osm')
    const source = `${directory}/java-latest.osm.pbf`
    const clipped = `${directory}/bandung-raya.osm.pbf`
    const clipBox = Object.values(CLIP_BOUNDS).join(',')
    const extent = await ServiceArea.findExtent()
    if (
      !extent ||
      extent.west < CLIP_BOUNDS.west ||
      extent.south < CLIP_BOUNDS.south ||
      extent.east > CLIP_BOUNDS.east ||
      extent.north > CLIP_BOUNDS.north
    ) {
      throw new Error(
        `The clip box ${clipBox} must contain every service area (extent: ${JSON.stringify(extent)}). Seed the service areas or widen CLIP_BOUNDS.`
      )
    }
    await mkdir(directory, { recursive: true })

    if (this.refresh || !existsSync(source)) {
      this.logger.info(`Downloading ${SOURCE_URL}`)
      const response = await fetch(SOURCE_URL, {
        headers: { 'User-Agent': 'UmimaClean-skripsi/1.0' },
      })
      if (!response.ok || !response.body) {
        throw new Error(`Download failed with HTTP ${response.status}`)
      }
      await pipeline(
        Readable.fromWeb(response.body as ReadableStream),
        createWriteStream(`${source}.part`)
      )
      await rename(`${source}.part`, source)
    }

    await this.#exec('osmium', [
      'extract',
      `--bbox=${clipBox}`,
      '--strategy=smart',
      '--option=types=multipolygon,boundary',
      '--overwrite',
      `--output=${clipped}`,
      source,
    ])

    await db.rawQuery(await this.#sql('schema.sql'))
    await db.rawQuery('CREATE SCHEMA IF NOT EXISTS osm_import')
    await this.#exec(
      'osm2pgsql',
      [
        '--create',
        '--output=flex',
        `--style=${app.makePath('database/osm/import.lua')}`,
        '--schema=osm_import',
        `--database=${env.get('DB_DATABASE')}`,
        `--host=${env.get('DB_HOST')}`,
        `--port=${env.get('DB_PORT')}`,
        `--user=${env.get('DB_USER')}`,
        clipped,
      ],
      { PGPASSWORD: env.get('DB_PASSWORD').release() }
    )

    const build = await this.#sql('build.sql')
    await db.transaction((transaction) => transaction.rawQuery(build))
    await db.rawQuery('DROP SCHEMA osm_import CASCADE')

    const counts = await db.rawQuery(
      `SELECT (SELECT count(*) FROM osm.roads) AS roads,
              (SELECT count(*) FROM osm.pois) AS pois,
              (SELECT count(*) FROM osm.areas) AS areas`
    )
    this.logger.success(`osm schema loaded: ${JSON.stringify(counts.rows[0])}`)
  }

  #sql(file: string) {
    return readFile(app.makePath('database/osm', file), 'utf8')
  }

  #exec(command: string, args: string[], variables: Record<string, string> = {}) {
    this.logger.info(`${command} ${args.join(' ')}`)
    return new Promise<void>((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        env: { ...process.env, ...variables },
      })
      child.on('error', reject)
      child.on('exit', (code) =>
        code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`))
      )
    })
  }
}
