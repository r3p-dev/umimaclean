-- osm2pgsql flex style for `node ace osm:import`. Writes raw staging tables (schema osm_import,
-- set with --schema); database/osm/build.sql then copies them into the osm tables.

local roads = osm2pgsql.define_way_table('roads', {
  { column = 'name', type = 'text', not_null = true },
  { column = 'highway', type = 'text', not_null = true },
  { column = 'geom', type = 'linestring', projection = 4326, not_null = true },
})

local pois = osm2pgsql.define_table({
  name = 'pois',
  ids = { type = 'any', id_column = 'osm_id', type_column = 'osm_type' },
  columns = {
    { column = 'name', type = 'text', not_null = true },
    { column = 'category', type = 'text', not_null = true },
    { column = 'street', type = 'text' },
    { column = 'geom', type = 'point', projection = 4326, not_null = true },
  },
})

local boundaries = osm2pgsql.define_relation_table('boundaries', {
  { column = 'level', type = 'int2', not_null = true },
  { column = 'name', type = 'text', not_null = true },
  { column = 'postcode', type = 'text' },
  { column = 'geom', type = 'multipolygon', projection = 4326, not_null = true },
})

local ROAD_CLASSES = {
  motorway = true, trunk = true, primary = true, secondary = true, tertiary = true,
  unclassified = true, residential = true, living_street = true, service = true,
  pedestrian = true, track = true, footway = true, path = true,
}

local POI_KEYS = { 'amenity', 'shop', 'tourism', 'leisure', 'office', 'healthcare', 'craft', 'historic' }

local PLACES = {
  suburb = true, quarter = true, neighbourhood = true, village = true, hamlet = true,
  isolated_dwelling = true, locality = true,
}

local function category(tags)
  for _, key in ipairs(POI_KEYS) do
    if tags[key] and tags[key] ~= 'no' then
      return key .. '=' .. tags[key]
    end
  end
  if tags.place and PLACES[tags.place] then
    return 'place=' .. tags.place
  end
  if tags.railway == 'station' or tags.railway == 'halt' then
    return 'railway=' .. tags.railway
  end
  return nil
end

local function add_poi(object, geom)
  local kind = category(object.tags)
  if object.tags.name and kind then
    pois:insert({ name = object.tags.name, category = kind, street = object.tags['addr:street'], geom = geom })
  end
end

function osm2pgsql.process_node(object)
  add_poi(object, object:as_point())
end

function osm2pgsql.process_way(object)
  local tags = object.tags
  if tags.name and tags.highway and ROAD_CLASSES[tags.highway] then
    roads:insert({ name = tags.name, highway = tags.highway, geom = object:as_linestring() })
  end
  if object.is_closed and not tags.highway then
    add_poi(object, object:as_polygon():centroid())
  end
end

function osm2pgsql.process_relation(object)
  local tags = object.tags
  local level = tonumber(tags.admin_level)
  if tags.boundary == 'administrative' and tags.name and level and level >= 5 and level <= 7 then
    boundaries:insert({
      level = level,
      name = tags.name,
      postcode = tags.postal_code or tags['addr:postcode'],
      geom = object:as_multipolygon(),
    })
  end
  if tags.type == 'multipolygon' then
    add_poi(object, object:as_multipolygon():centroid())
  end
end
