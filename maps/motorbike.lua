-- OSRM motorbike profile for staff trips. osrm-backend ships no motorcycle profile, so this one
-- starts from its car.lua (mounted next to it at /opt, so require('car') and lib/ resolve) and
-- changes only what differs for a motorbike in Bandung:
--   * Access: motorcycle=* is read first, so motorcycle=no blocks a way and motorcycle=yes opens
--     a footway or path; turn restrictions honour motorcycle exceptions the same way.
--   * Blocked: highway=motorway and motorway_link, toll=yes and motorroad=yes. Motorbikes may not
--     use toll roads in Indonesia (STAFF-6: "no toll roads").
--   * Size: 0.8 m wide, 1.5 m high, 2 m long, 250 kg, so narrow roads (width down to 0.8 m,
--     narrow=yes) stay routable.
--   * Bollards are passable; they stop cars, not motorbikes.
--   * Alleys (service=alley) are penalised less than for cars: a gang is a normal route.
--   * Speeds: typical urban speeds in traffic instead of free-flow car speeds, capped at 60 km/h.
--   * maxspeed tags are ignored (see below).
-- The driving side is not set: since v26.10, OSRM resolves it per way from its location data.

local car = require('car')

-- maxspeed tags carry legal limits, not real motorbike speeds in city traffic, and car.lua has no
-- option to skip them, so its maxspeed handler is replaced with one that does nothing.
WayHandlers.maxspeed = function() end

local function setup()
  local profile = car.setup()

  profile.default_speed = 10
  profile.vehicle_max_speed = 60
  profile.vehicle_width = 0.8
  profile.vehicle_height = 1.5
  profile.vehicle_length = 2.0
  profile.vehicle_weight = 250

  profile.access_tags_hierarchy = Sequence { 'motorcycle', 'motor_vehicle', 'vehicle', 'access' }
  profile.restrictions = Sequence { 'motorcycle', 'motor_vehicle', 'vehicle' }
  profile.access_tag_whitelist = Set {
    'yes', 'motorcycle', 'motor_vehicle', 'vehicle', 'permissive', 'designated'
  }

  profile.avoid.toll = true
  profile.avoid.motorroad = true
  profile.avoid.motorway = true
  profile.avoid.motorway_link = true

  profile.barrier_whitelist.bollard = true
  profile.service_penalties.alley = 0.8

  profile.speeds = Sequence {
    highway = {
      trunk          = 40,
      trunk_link     = 30,
      primary        = 35,
      primary_link   = 25,
      secondary      = 30,
      secondary_link = 25,
      tertiary       = 25,
      tertiary_link  = 20,
      unclassified   = 22,
      residential    = 18,
      living_street  = 12,
      service        = 12,
      track          = 10
    }
  }

  return profile
end

return {
  setup = setup,
  process_way = car.process_way,
  process_node = car.process_node,
  process_turn = car.process_turn
}
