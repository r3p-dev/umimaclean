import { existsSync, readdirSync } from 'node:fs'

const BASE_MAP_FILE = /^bandung-raya-\d{8}\.pmtiles$/

export function baseMapFileName(build: string) {
  return `bandung-raya-${build}.pmtiles`
}

export function findBaseMapFiles(directory: string) {
  if (!existsSync(directory)) {
    return []
  }
  return readdirSync(directory)
    .filter((name) => BASE_MAP_FILE.test(name))
    .sort()
    .reverse()
}
