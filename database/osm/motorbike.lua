-- OSRM motorbike profile for the courier, built on the car.lua shipped with osrm-backend
-- (no motorcycle profile ships with it). Mounted next to car.lua at /opt so require('car') and
-- its lib/ helpers resolve. Changes from car.lua:
--   * Access: motorcycle=* is read first (motorcycle, motor_vehicle, vehicle, access), so
--     motorcycle=no blocks a way and motorcycle=yes opens a footway/path; turn restrictions
--     honour motorcycle exceptions the same way.
--   * Blocked: highway=motorway and motorway_link (toll roads, closed to motorbikes in
--     Indonesia), any way with toll=yes, and motorroad=yes.
--   * Size: 0.8 m wide, 1.5 m high, 2 m long, 250 kg, so narrow residential and service roads
--     (width tags down to 0.8 m, narrow=yes) stay routable.
--   * Barriers: bollards are passable (they usually stop cars, not motorbikes).
--   * Alleys (service=alley) are penalised less (0.8 instead of 0.5): gang are normal routes.
--   * Speeds: average urban Bandung speeds in traffic instead of free-flow car speeds;
--     maxspeed tags are ignored (legal limits, not real speeds) and nothing exceeds 60 km/h.
--     Ways allowed only by an access tag (motorcycle=yes footway, path) use 10 km/h.
--   * Indonesia drives on the left (turn costs).

local car = require('car')

WayHandlers.maxspeed = function() end

local function motorbike_setup()
  local profile = car.setup()

  profile.properties.left_hand_driving = true
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
  setup = motorbike_setup,
  process_way = car.process_way,
  process_node = car.process_node,
  process_turn = car.process_turn
}
