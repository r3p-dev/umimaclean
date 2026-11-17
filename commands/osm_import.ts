import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { args, BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import ServiceArea from '#models/service_area'

async function hashFile(filePath: string, algorithm: 'md5' | 'sha256') {
  const hash = createHash(algorithm)
  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk)
  }
  return hash.digest('hex')
}

// Development only (D91): production loads the dump this writes with two documented commands
// (docs/SETUP.md, "OSM data in production"), because clipping needs about 4 GB of memory.
export default class OsmImport extends BaseCommand {
  static override commandName = 'osm:import'
  static override description =
    'Clip a dated Geofabrik Java snapshot to the service areas, load it into the osm schema and write the staging dump for production'

  static override options: CommandOptions = { startApp: true }

  @args.string({ description: 'Snapshot date as in java-YYMMDD.osm.pbf, for example 261101' })
  declare snapshot: string

  override async run() {
    if (!this.app.inDev) {
      this.logger.error('osm:import runs only in development; see docs/SETUP.md for production')
      this.exitCode = 1
      return
    }
    if (!/^\d{6}$/.test(this.snapshot)) {
      this.logger.error('The snapshot is a date like 261101 (java-261101.osm.pbf)')
      this.exitCode = 1
      return
    }

    const snapshotFile = `java-${this.snapshot}.osm.pbf`
    const snapshotPath = this.app.makePath('storage/osm', snapshotFile)
    const md5File = await readFile(`${snapshotPath}.md5`, 'utf8')
    const expectedMd5 = md5File.split(/\s+/)[0]
    const actualMd5 = await hashFile(snapshotPath, 'md5')
    if (actualMd5 !== expectedMd5) {
      this.logger.error(`MD5 of ${snapshotFile} is ${actualMd5}, Geofabrik says ${expectedMd5}`)
      this.exitCode = 1
      return
    }
    this.logger.info(
      `${snapshotFile}: MD5 ${actualMd5}, SHA-256 ${await hashFile(snapshotPath, 'sha256')}`
    )

    const clip = JSON.parse(await readFile(this.app.makePath('maps/clip_polygon.geojson'), 'utf8'))
    const outside = await ServiceArea.findNamesOutside(JSON.stringify(clip.features[0].geometry))
    if (outside.length > 0) {
      this.logger.error(`maps/clip_polygon.geojson does not cover: ${outside.join(', ')}`)
      this.exitCode = 1
      return
    }
    this.logger.info('maps/clip_polygon.geojson covers every service area')

    await this.#tool('map-tools', [
      'osmium',
      'extract',
      '--polygon=/maps/clip_polygon.geojson',
      '--strategy=smart',
      '--option=types=multipolygon,boundary',
      '--overwrite',
      '--output=/data/bandung-raya.osm.pbf',
      `/data/${snapshotFile}`,
    ])
    await this.#tool('psql', [
      '-q',
      '-c',
      'DROP SCHEMA IF EXISTS osm_import CASCADE; CREATE SCHEMA osm_import',
    ])
    await this.#tool('map-tools', [
      'sh',
      '-c',
      'PGPASSWORD="$DB_PASSWORD" osm2pgsql --create --output=flex --style=/maps/osm_import.lua --schema=osm_import --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USER" --database="$DB_DATABASE" /data/bandung-raya.osm.pbf',
    ])

    const dumpFile = `osm-import-${this.snapshot}.dump`
    await this.#tool('pg-client', [
      'pg_dump',
      '--no-owner',
      '--schema=osm_import',
      '--format=custom',
      `--file=/data/${dumpFile}`,
    ])
    const dumpPath = this.app.makePath('storage/osm', dumpFile)
    await writeFile(`${dumpPath}.sha256`, `${await hashFile(dumpPath, 'sha256')}  ${dumpFile}\n`)
    this.logger.info(`Wrote storage/osm/${dumpFile} and its .sha256`)

    // The same refill production runs: one transaction, so search never sees half-loaded tables.
    await this.#tool('psql', [
      '-q',
      '--single-transaction',
      '-f',
      '/maps/osm_schema.sql',
      '-f',
      '/maps/osm_build.sql',
    ])
    this.logger.success(`osm schema loaded from ${snapshotFile}`)
  }

  // Runs one compose tool service (compose.yaml, profile "tools") and fails the command if it fails.
  #tool(service: string, toolArgs: string[]) {
    this.logger.info(`${service}: ${toolArgs.join(' ')}`)
    return new Promise<void>((resolve, reject) => {
      const child = spawn(
        'podman',
        ['compose', '--profile', 'tools', 'run', '--rm', '-T', service, ...toolArgs],
        {
          cwd: this.app.appRoot,
          stdio: 'inherit',
        }
      )
      child.on('error', reject)
      child.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`${service} exited with code ${code}`))
        }
      })
    })
  }
}
