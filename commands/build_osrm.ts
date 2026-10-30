import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { chmod, copyFile, mkdir, readdir, rm } from 'node:fs/promises'
import { BaseCommand } from '@adonisjs/core/ace'
import app from '@adonisjs/core/services/app'

const OSRM_IMAGE = 'ghcr.io/project-osrm/osrm-backend:v26.9.0-debian'
const NAME = 'bandung-raya'

export default class BuildOsrm extends BaseCommand {
  static override commandName = 'osrm:build'
  static override description =
    'Build the OSRM motorbike routing files from the clipped extract of osm:import'

  override async run() {
    const source = app.makePath(`storage/osm/${NAME}.osm.pbf`)
    const directory = app.makePath('storage/osrm')
    if (!existsSync(source)) {
      throw new Error(`${source} is missing; run \`node ace osm:import\` first`)
    }

    await rm(directory, { recursive: true, force: true })
    await mkdir(directory, { recursive: true })
    await copyFile(source, `${directory}/${NAME}.osm.pbf`)

    const mounts = [
      `--volume=${directory}:/data:z`,
      `--volume=${app.makePath('database/osm/motorbike.lua')}:/opt/motorbike.lua:ro,z`,
    ]
    await this.#exec([
      ...mounts,
      OSRM_IMAGE,
      'osrm-extract',
      '--profile=/opt/motorbike.lua',
      `/data/${NAME}.osm.pbf`,
    ])
    await this.#exec([...mounts, OSRM_IMAGE, 'osrm-contract', `/data/${NAME}.osrm`])
    await rm(`${directory}/${NAME}.osm.pbf`)

    const files = await readdir(directory)
    for (const file of files) {
      await chmod(`${directory}/${file}`, 0o644)
    }
    this.logger.success(`${files.length} OSRM files in storage/osrm`)
  }

  #exec(args: string[]) {
    const command = ['run', '--rm', ...args]
    this.logger.info(`podman ${command.join(' ')}`)
    return new Promise<void>((resolve, reject) => {
      const child = spawn('podman', command, { stdio: 'inherit' })
      child.on('error', reject)
      child.on('exit', (code) =>
        code === 0 ? resolve() : reject(new Error(`podman exited with ${code}`))
      )
    })
  }
}
