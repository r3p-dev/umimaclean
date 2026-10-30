import { spawn } from 'node:child_process'
import { chmod, mkdir, rename, rm, stat } from 'node:fs/promises'
import { BaseCommand, flags } from '@adonisjs/core/ace'
import app from '@adonisjs/core/services/app'
import { baseMapFileName, findBaseMapFiles } from '#helpers/base_map'
import { CLIP_BOUNDS } from './import_osm.js'

const PROTOMAPS_BUILD = '20261029'

export default class ExtractTiles extends BaseCommand {
  static override commandName = 'tiles:extract'
  static override description =
    'Extract the Bandung Raya map tiles from a Protomaps basemap build with the pmtiles CLI'

  @flags.string({ description: `Protomaps build date (default ${PROTOMAPS_BUILD})` })
  declare build?: string

  override async run() {
    const build = this.build ?? PROTOMAPS_BUILD
    if (!/^\d{8}$/.test(build)) {
      this.logger.error('--build must be a Protomaps build date (YYYYMMDD)')
      this.exitCode = 1
      return
    }
    const directory = app.makePath('public/tiles')
    const name = baseMapFileName(build)
    const target = `${directory}/${name}`
    const partial = `${target}.partial`
    const source = `https://build.protomaps.com/${build}.pmtiles`
    await mkdir(directory, { recursive: true })
    await rm(partial, { force: true })

    const args = ['extract', source, partial, `--bbox=${Object.values(CLIP_BOUNDS).join(',')}`]
    this.logger.info(`pmtiles ${args.join(' ')}`)
    await new Promise<void>((resolve, reject) => {
      const child = spawn('pmtiles', args, { stdio: 'inherit' })
      child.on('error', reject)
      child.on('exit', (code) =>
        code === 0 ? resolve() : reject(new Error(`pmtiles exited with ${code}`))
      )
    })

    await chmod(partial, 0o644)
    await rename(partial, target)
    for (const older of findBaseMapFiles(directory).filter((file) => file !== name)) {
      await rm(`${directory}/${older}`)
      this.logger.info(`removed public/tiles/${older}`)
    }
    const { size } = await stat(target)
    this.logger.success(`${(size / 1024 / 1024).toFixed(0)} MB in public/tiles/${name}`)
  }
}
