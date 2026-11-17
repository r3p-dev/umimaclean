import { existsSync } from 'node:fs'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'

// Why a map has no base map, said in development only (M4a-fix1): an empty setting or a missing file.
export function tilesWarning(file: string | undefined, isFilePresent: boolean) {
  if (!file) {
    return 'Peta dasar tidak tampil: MAP_TILES_FILE kosong di .env (docs/SETUP.md Step 5).'
  }
  return isFilePresent ? null : `Peta dasar tidak tampil: public/tiles/${file} tidak ditemukan.`
}

// The base map file in public/tiles/ (docs/SETUP.md Step 5); without it maps draw a plain
// background and pins still work (MAP-2), in every environment.
export function mapTiles() {
  const file = env.get('MAP_TILES_FILE')
  const isFilePresent = file ? existsSync(app.publicPath('tiles', file)) : false
  const devWarning = app.inDev ? tilesWarning(file, isFilePresent) : null
  if (devWarning) {
    logger.warn(devWarning)
  }
  return { tilesUrl: isFilePresent ? `/tiles/${file}` : null, devWarning }
}
