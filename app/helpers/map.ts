import env from '#start/env'

// The base map file in public/tiles/ (docs/SETUP.md Step 5); without it maps draw a plain background (MAP-2).
export function mapTilesUrl() {
  const file = env.get('MAP_TILES_FILE')
  return file ? `/tiles/${file}` : null
}
