# Plan

Milestones in order. **Slow, reviewable progress**: each milestone is small enough to review the screens, read the code and understand how it works in one sitting. The implementer stops after every milestone and waits for confirmation (`AGENTS.md` §3). A milestone that grows is split into checkpoints (`M5a`, `M5b`, …), each with its own stop.

Requirement IDs refer to `docs/prd/`. In M0 the implementer adds **acceptance criteria** (by requirement ID) and an **hour estimate** to every milestone below, and may propose a different split; the plan is final once approved.

| #   | Version | Milestone                               | Status      | Hours |
| --- | ------- | --------------------------------------- | ----------- | ----- |
| M0  | –       | Spikes and plan                         | not started | –     |
| M1  | 0.1.0   | Foundation and look                     | not started | –     |
| M2  | 0.2.0   | Accounts                                | not started | –     |
| M3  | 0.3.0   | Services, service areas, store settings | not started | –     |
| M4  | 0.4.0   | Addresses and maps                      | not started | –     |
| M5  | 0.5.0   | Online ordering and tracking            | not started | –     |
| M6  | 0.6.0   | Courier trips                           | not started | –     |
| M7  | 0.7.0   | Workshop                                | not started | –     |
| M8  | 0.8.0   | Payments                                | not started | –     |
| M9  | 0.9.0   | Walk-in orders                          | not started | –     |
| M10 | 0.10.0  | Owner area                              | not started | –     |
| M11 | 0.11.0  | Live updates and jobs                   | not started | –     |
| M12 | 1.0.0   | Hardening and release                   | not started | –     |

## M0: Spikes and plan

No application code. Stop and report after this.

1. Read `docs/prd/` and list anything unclear, contradictory or missing.
2. Local services with Podman: PostgreSQL + PostGIS and OSRM (pinned images). Show that both start from a clean machine with the documented commands.
3. Map data: the OSM extract → `osm` schema import, the OSRM motorbike build, the PMTiles extract for Bandung Raya. Document tools, versions, sources, licenses, sizes and commands. Data files are not committed.
4. Check the current docs for Midtrans Core API QRIS, Fonnte, Turnstile, Transmit, shadcn's React Aria base, Leaflet and protomaps-leaflet. Note anything that affects the design, and confirm that each tool is maintained.
5. Decide whether the generated `.adonisjs/` directory stays committed (it is today), following the official AdonisJS recommendation, and how scheduled jobs run locally and in production.
6. Write `docs/ARCHITECTURE.md` §2–§7 and complete this plan (acceptance criteria and hours per milestone). List any decision in `docs/ARCHITECTURE.md` §1 you believe must change, and why.

## M1 (0.1.0): Foundation and look

Tailwind, shadcn (React Aria base) with the brand values in shadcn's theme variables, the atomic folders, the page templates per area, error pages. Public: landing with its static sections, terms and privacy (GUEST-1 static parts, GUEST-2, GUEST-3). Review focus: does it look right.

## M2 (0.2.0): Accounts

Replace the starter's email login with phone + password. GUEST-10, GUEST-11, GUEST-12, STAFF-1 (sign-in part), ACC-1…ACC-5, CUST-12, CUST-13 (without walk-in linking), OWN-13 (OTP over WhatsApp with the log driver), Turnstile, role redirects, empty home pages per role, the first owner account (ace command or seeder).

## M3 (0.3.0): Services, service areas, store settings

SVC-1…SVC-5, AREA-1…AREA-3, OWN-7, OWN-8 (shop info and slots), OWN-9, the landing price list and coverage check (GUEST-1).

## M4 (0.4.0): Addresses and maps

AREA-4, MAP-1, MAP-2, CUST-2, CUST-3, CUST-14.

## M5 (0.5.0): Online ordering and tracking

SLOT-1…SLOT-3, ORD-1…ORD-4 (without live updates), CUST-1, CUST-4…CUST-9 (including the declared items), GUEST-4…GUEST-6, the "order received" message (MSG-1, MSG-3, MSG-4).

## M6 (0.6.0): Courier trips

STAFF-2…STAFF-7, PHOTO-1, PHOTO-2, the "courier on the way" message.

## M7 (0.7.0): Workshop

STAFF-8…STAFF-11, the "bill" message.

## M8 (0.8.0): Payments

PAY-1…PAY-6, CUST-10, CUST-11, the payment reminders job.

## M9 (0.9.0): Walk-in orders

STAFF-12…STAFF-15, GUEST-7…GUEST-9, GUEST-13 and the walk-in part of CUST-13 (linking walk-in history), the "order received" message after counter payment.

## M10 (0.10.0): Owner area

OWN-1…OWN-6, OWN-8 (payment methods, inactivity threshold), OWN-10…OWN-12, OWN-14, STAFF-16, the "cancelled by the shop" and "come back reminder" messages, MSG-2.

## M11 (0.11.0): Live updates and jobs

ORD-4 live updates (order page, staff queues, owner orders), PHOTO-3 pruning job.

## M12 (1.0.0): Hardening and release

Self-review against `docs/ARCHITECTURE.md` §1.2 and NFR-1…NFR-7 with findings fixed; browser journeys for every role end to end; accessibility check; production `Containerfile` with a health check; `npm audit` reviewed; `CHANGELOG.md` complete; version 1.0.0.
