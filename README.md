# Umima Clean

Shoe, bag and helmet cleaning service with pickup and delivery in Bandung Raya, built with AdonisJS, Inertia and React.

## Setup

Needs Node.js 24 and PostgreSQL 17 with PostGIS 3 (for example the `docker.io/postgis/postgis:17-3.5` image). The database user must be allowed to run `CREATE EXTENSION postgis`; the `service_areas` migration does it.

```
npm install
cp .env.example .env
node ace generate:key
```

Fill in `DB_USER`, `DB_PASSWORD` and `DB_DATABASE` in `.env`, and create that database plus `umimaclean_test` (used by `npm test`, see `.env.test`). Then:

```
node ace migration:fresh --seed
npm run dev
```

The seeder logs the demo accounts; every one has the password `password` (the owner uses `ADMIN_PHONE` when it is set). Without `FONNTE_TOKEN` WhatsApp messages are written to the log instead of sent; without `MIDTRANS_SERVER_KEY` QRIS is shown as unavailable. The Turnstile keys in `.env.example` are Cloudflare's test keys.

```
npm test
npm run typecheck
npm run lint
```

## Production image

[`Containerfile`](Containerfile) is multi-stage: the build stage runs a full `npm ci` (Vite, the Tailwind build that reads `shadcn/tailwind.css` and `@adonisjs/assembler` are dev dependencies) and `node ace build`; the final stage copies `build/` and runs `npm ci --omit=dev` inside it. Don't add `--omit=optional` without a build and boot test: it also drops platform-specific optional packages. `.adonisjs/` is part of the build context because Vite imports its generated registry.

## Deploying

Every push to `main` runs [CI](.github/workflows/ci.yml) (typecheck, lint, tests against PostGIS, build). When it passes, [CD](.github/workflows/cd.yml) builds the image with Podman, pushes it to `ghcr.io/r3p-dev/umimaclean` and sends [`compose.yaml`](compose.yaml) over SSH to the server (`vps-setup.sh`), which turns it into Quadlet units, waits for the health checks and rolls back if they fail.

`compose.yaml` runs four services: `web` (runs `node ace migration:run --force` and `node ace db:seed`, then the server, on `umimaclean.r3p.dev`), `scheduler` (the jobs below), `db` (`docker.io/postgis/postgis`) and `osrm` (courier routing, internal only, see [Routing](#routing-osrm)). Proof photos, the database, the routing files and the map tiles live in the named volumes `umimaclean-proofs`, `umimaclean-pgdata`, `umimaclean-osrm` and `umimaclean-tiles`.

One-time setup on the server, as the deploy user:

1. Allow the PostGIS and OSRM images: add `ALLOWED_IMAGES="ghcr.io/r3p-dev/ docker.io/library/ docker.io/postgis/ ghcr.io/project-osrm/"` to `/etc/vps/vps.conf`, then `sudo vps init`.
2. Load the routing files into `umimaclean-osrm` ([Routing](#routing-osrm)) and the map tiles into `umimaclean-tiles` ([Map tiles](#map-tiles-pmtiles)). Until they are there `osrm` retries every minute and the app uses estimates, and maps show a plain background; the deploy itself does not wait for either.
3. Secrets (one `.env` for every service): `vps env umimaclean ADMIN_PHONE=… APP_KEY=… DB_PASSWORD=… POSTGRES_PASSWORD=… TURNSTILE_SITE_KEY=… TURNSTILE_SECRET_KEY=… FONNTE_TOKEN=… MIDTRANS_SERVER_KEY=… MIDTRANS_IS_PRODUCTION=…` (`DB_PASSWORD` and `POSTGRES_PASSWORD` are the same value).
4. `vps ci-key umimaclean` and put the 5 values it prints in the repo's `production` environment secrets; point the DNS of `umimaclean.r3p.dev` at the server.
5. Push. On its first start `web` seeds production (`database/seeders/main/production_seeder.ts`): the owner account, the store settings and the kecamatan. The owner signs in with `ADMIN_PHONE` and the password `password`, and changes it in Profil right away. Once an owner exists the seeder does nothing, so later deploys never touch the owner's settings or areas; without `ADMIN_PHONE` the first start fails and the deploy rolls back.

### Backups

Dump the app data without the OSM tables, which are rebuilt from the import instead. Set `DB_CONTAINER` to the database container's name (`podman ps --format '{{.Names}}'` lists them; on the VPS it ends in `-db`):

```
DB_CONTAINER=umimaclean-db
podman exec "$DB_CONTAINER" pg_dump -U umimaclean -d umimaclean --exclude-schema=osm -Fc > umimaclean-$(date +%F).dump
podman exec "$DB_CONTAINER" pg_dump -U umimaclean -d umimaclean -n osm -Fc > osm-$(date +%F).dump
```

Restore the app dump with `pg_restore --clean --if-exists -d umimaclean`; restore `osm` as described in [Map data](#map-data-osm-schema).

### Known audit finding

`npm audit` reports the braces advisory [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) (stack exhaustion on deeply nested glob patterns), through `fast-glob` and `micromatch`. It is only used by build and dev tooling (`@adonisjs/assembler`, `hot-hook`, ESLint, the shadcn CLI) on their own patterns, never on request data, so it is not reachable at runtime. No fixed braces version exists yet; re-check with `npm audit` later. Don't run `npm audit fix --force`: it downgrades AdonisJS to 5.x.

## Behind the reverse proxy

In production every request reaches the app through Traefik. The app takes the client IP from `X-Forwarded-For` only when the request comes from a trusted proxy address, set in `TRUSTED_PROXIES` (comma-separated [proxy-addr](https://www.npmjs.com/package/proxy-addr) values). The default `loopback,uniquelocal` trusts 127.0.0.0/8, ::1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 and fc00::/7, which covers the Podman network Traefik uses; a narrower value such as `10.89.0.0/24` also works. Requests from any other address keep their own IP and the header is ignored.

The per-IP limits (login, OTP, tracking digits, `GET /area`) depend on this. Two things to keep true on the server:

- Do not publish the app container's port; only Traefik should reach it.
- Traefik itself must see the real client address. Check that its access log shows public client IPs, not a Podman gateway address (rootless Podman with `pasta` keeps the source address).

## Scheduled jobs

The `scheduler` service in `compose.yaml` runs two ace commands in a loop, every 15 minutes:

| Command                          | When                                         | What it does                                                                                                                                                                                                                                   |
| -------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node ace orders:remind-payment` | every 15 minutes                             | Sends due WhatsApp payment reminders for unpaid online orders (24 hours after the bill, then every 2 days, only between 10:00 and 15:00 Asia/Jakarta). Safe to run repeatedly; a failed send is retried on the next run. Never calls Midtrans. |
| `node ace proofs:prune`          | when the service starts, then every 24 hours | Deletes proof photos older than 90 days.                                                                                                                                                                                                       |

The reminder command checks the 10:00–15:00 window itself, so the loop runs around the clock. Read their output with `vps logs umimaclean`.

## Data sources

### Kecamatan boundaries (`database/data/service_areas.geojson`)

- **Source:** "Indonesia – Subnational Administrative Boundaries" (OCHA COD-AB), data from Badan Pusat Statistik (BPS), published on HDX: <https://data.humdata.org/dataset/cod-ab-idn>.
- **Licence:** [CC BY-IGO](https://creativecommons.org/licenses/by/3.0/igo/). The pages with a pin map show "Batas wilayah: BPS, via HDX (CC BY-IGO)".
- **Downloaded:** 2026-10-23, dataset version updated on HDX 2026-06-23, file `idn_admin_boundaries.geojson.zip` (456,203,094 bytes, SHA-256 `d285a40f9fc4b726b1bda98ee833d52d23d94fe78b6a47c0a769d2e912ff0970`). Only the result is committed.
- **Filtered:** the kecamatan layer (`idn_admin3.geojson`) of Kota Bandung (`ID3273`, 30), Kota Cimahi (`ID3277`, 3), Kabupaten Bandung (`ID3204`, 31) and Kabupaten Bandung Barat (`ID3217`, 16): 80 kecamatan. The feature `ID3217888` "Waduk" (the reservoir, not a kecamatan) is left out. Each feature keeps three properties: `code` (BPS / COD-AB code), `name` (kecamatan, BPS spelling) and `city` (`Kota …` as published, `Kabupaten …` added in front of the regency names).
- **Simplified:** Douglas–Peucker with a 10 m tolerance on the shared topology (neighbouring kecamatan keep one common edge, so no gaps or overlaps appear), coordinates rounded to 6 decimals. Size: 3,982,422 bytes before, 614,383 bytes after. Every outline stays within 10 m of the original.
- **Loaded by:** `database/seeders/service_area_seeder.ts`, which only reads this file (no network). It switches on all of Kota Bandung and Kota Cimahi and, in Kabupaten Bandung, Margaasih, Margahayu, Dayeuhkolot, Bojongsoang, Baleendah, Katapang, Soreang, Pameungpeuk, Banjaran and Cangkuang; every other kecamatan starts off. The owner changes this in Pengaturan → Area layanan.

To rebuild the file (needs `curl`, `unzip` and Node; mapshaper runs through `npx` and is not a project dependency):

```
curl -L -o idn_admin_boundaries.geojson.zip \
  'https://data.humdata.org/dataset/84a1d98a-790b-4d66-9d14-bbfa48500802/resource/e1421da4-8f48-47d2-ac49-79ff5bfa4d24/download/idn_admin_boundaries.geojson.zip'
unzip idn_admin_boundaries.geojson.zip idn_admin3.geojson
npx --yes mapshaper@0.7.97 idn_admin3.geojson \
  -filter '["ID3204","ID3217","ID3273","ID3277"].includes(adm2_pcode) && adm3_pcode != "ID3217888"' \
  -each 'code = adm3_pcode, name = adm3_name, city = adm2_name.startsWith("Kota") ? adm2_name : "Kabupaten " + adm2_name' \
  -filter-fields code,name,city \
  -sort code \
  -simplify dp interval=10 keep-shapes \
  -o precision=0.000001 format=geojson database/data/service_areas.geojson
```

### Map deploy checklist

On the server, in this order (each step links to its details):

1. Add `ghcr.io/project-osrm/` to `ALLOWED_IMAGES` in `/etc/vps/vps.conf`, then `sudo vps init` ([Deploying](#deploying), step 1).
2. Restore the `osm` schema dump ([Map data](#map-data-osm-schema)). It goes into the running database, so on a brand-new server do it after the first deploy instead.
3. Import the routing files into the `umimaclean-osrm` volume ([Routing](#routing-osrm)).
4. Import the tiles into the `umimaclean-tiles` volume ([Map tiles](#map-tiles-pmtiles)).
5. Deploy (push to `main`).
6. Check the tiles through the proxy with the range-request `curl` ([Map tiles](#map-tiles-pmtiles)) and routing with the OSRM `/nearest` request ([Routing](#routing-osrm)).

### Map data (`osm` schema)

Address search, the nearby list and the street label under the map pin (`GET /lokasi`, `GET /lokasi/titik`, `PlaceService`) read OpenStreetMap data from the `osm` schema of the app database. Nothing is sent to an outside geocoder. Search covers the extent of `service_areas` plus 0.03° (read once per process, so restart after reseeding the areas) and matches typos with `pg_trgm` word similarity 0.5, set per search transaction (`SET LOCAL`). Spaces are also ignored for prefix and substring matches (`dipati ukur` finds Jalan Dipatiukur). Generic words (`jalan`, `jl`, `jln`, `gang`, `gg`, `komplek`, `kompleks`, `komp`, `perumahan`, `perum`, `blok`) are dropped from a query that has other words, and among equally similar matches roads come before other places, then the nearest first. The schema is not managed by migrations: `migration:fresh`, `db:wipe` and the test reset only touch `public` (no `searchPath` is configured), so it survives them. Without it the endpoints answer empty and the address form falls back to placing the pin by hand.

- **Source:** Geofabrik's Java extract, <https://download.geofabrik.de/asia/indonesia/java-latest.osm.pbf>, © OpenStreetMap contributors, [ODbL](https://opendatacommons.org/licenses/odbl/).
- **Files:** everything downloaded or generated lives in `storage/osm/` (git-ignored through `/storage`): `java-latest.osm.pbf` and the clipped `bandung-raya.osm.pbf`.
- **Kept:** named roads (merged per name and kelurahan), named POIs (amenity, shop, tourism, leisure, office, healthcare, craft, historic, railway stations and `place` names) and admin boundaries at levels 5 (kota/kabupaten), 6 (kecamatan) and 7 (kelurahan/desa) with their `postal_code`. The clip keeps boundary relations whole (`--option=types=multipolygon,boundary`). See `database/osm/import.lua`, `schema.sql` and `build.sql`.
- **Labels:** kecamatan and city come from `service_areas` (BPS spelling); only kelurahan/desa and postcode come from OSM, which also covers points outside every service area. OSM maps kelurahan boundaries only for Kota Bandung and has a postcode on 18 of 530 of them, so elsewhere the label has no kelurahan and most labels have no postcode.
- **Size:** about 14,000 roads, 16,700 POIs and 620 boundaries, 25 MB with indexes. The import takes about 30 s; osm2pgsql peaks at about 4 GB RAM, which is why it runs on the development machine and not on the VPS.

Import on the development machine (Fedora):

```
sudo dnf install osmium-tool osm2pgsql
node ace osm:import            # --refresh downloads the Java extract again
```

On Debian or Ubuntu the packages have the same names (`sudo apt install osmium-tool osm2pgsql`); the style needs osm2pgsql 2.x (developed with 2.2.0 and osmium 1.19.1), so check `osm2pgsql --version` on older releases. There is no official container image for either tool; the VPS needs neither, since it only restores the dump below.

The command first checks that the clip box contains the extent of every row in `service_areas` and stops with an error if not (or if the table is empty), so seed the service areas first.

The command downloads the extract if it is missing, clips it with osmium to 107.05–108.05 E, 7.45–6.55 S (the 80 kecamatan plus a margin), runs `database/osm/schema.sql` (extensions `pg_trgm` and `unaccent`, the schema, tables and indexes; idempotent), loads the file with osm2pgsql into a staging schema `osm_import`, then refills the `osm` tables from it in one transaction (`database/osm/build.sql`) and drops the staging schema. Running it again replaces the data; requests during the swap wait for the transaction and never see empty tables. It reads the database settings from `.env` and needs no `psql` on the host.

Ship it to the server. `postgres` is the local development container; on the server, set `DB_CONTAINER` to the name `podman ps --format '{{.Names}}'` shows for the database (the Quadlet unit name, ending in `-db`):

```
podman exec postgres pg_dump -U user -d umimaclean -n osm -Fc > storage/osm/osm.dump
scp storage/osm/osm.dump database/osm/schema.sql <server>:
# on the server
DB_CONTAINER=umimaclean-db
podman exec -i "$DB_CONTAINER" psql -U umimaclean -d umimaclean -v ON_ERROR_STOP=1 < schema.sql
podman exec -i "$DB_CONTAINER" pg_restore -U umimaclean -d umimaclean --clean --if-exists --single-transaction < osm.dump
```

`schema.sql` first creates the extensions the dump depends on; `pg_restore --single-transaction` swaps the schema atomically. Refresh the data the same way: import locally, dump, restore.

### Routing (OSRM)

The courier's route line and the km/ETA on the trip board come from a self-hosted [OSRM](https://github.com/Project-OSRM/osrm-backend) (`ghcr.io/project-osrm/osrm-backend:v26.9.0-debian`, the `osrm` service). The browser asks `GET /staf/rute` (staff and owner only); `TaskService` asks OSRM `/route` for the line and one `/table` call for the legs of a board, cached for 5 minutes per leg. Each card shows the leg from the stop before it; the first card is measured from the courier's position ("dari posisi Anda") or, without GPS, from the store ("dari toko"), and the queue shows the total of the remaining legs. Estimated legs and totals that contain one are marked "±". When OSRM is not configured, down, slower than `OSRM_TIMEOUT_MS` or finds no route, the answer is an estimate (straight line × 1.3 at 25 km/h, `source: 'estimate'`); the map then shows its "route unavailable" alert and the active task shows the estimate from the courier's live position (from the store without GPS). Failed OSRM requests log one warning per minute in `web` with the number of failures since the last one. Settings: `OSRM_URL` (unset = always estimate; `http://osrm:5000` in `compose.yaml`), `OSRM_PROFILE` (`driving`; `osrm-routed` serves one profile and ignores the name) and `OSRM_TIMEOUT_MS` (2000).

- **Queue order:** the pickup queue keeps its blocks (overdue dates first, then each date and slot in order) and orders the stops inside each block nearest first by OSRM travel time; the delivery queue is ordered nearest first as a whole. Stops skipped today stay last. One `/table` call (at most 100 locations) per recompute starts from the courier's position (the pages that read GPS send it, rounded to 3 decimals, in an `X-Courier-Position` header), else from the store; after a completed stop it starts from that stop. The order is kept per courier and day, in memory, and recomputed only when a stop is completed or skipped, a new order joins the queue or an order's slot or address changes; a stop that leaves the queue (started, cancelled) is simply removed. If OSRM fails the scheduled order is shown with "Urutan belum dioptimasi" and retried after a minute. A restart forgets the plans; the next board load recomputes them.
- **Profile:** `database/osm/motorbike.lua`, a motorbike profile on top of the image's `car.lua` (osrm-backend ships no motorcycle profile). Its header lists each change: no motorway, `toll=yes` or `motorroad=yes`, `motorcycle=*` access tags first, narrow roads allowed, urban Bandung speeds, left-hand traffic.
- **Algorithm:** Contraction Hierarchies (`osrm-contract`, `--algorithm ch`). The map is static (no live traffic to apply), so MLD's fast re-customisation buys nothing, while CH answers `/route` and `/table` faster.
- **Files:** `storage/osrm/bandung-raya.osrm*` (23 files, 333 MB; git-ignored through `/storage`), built from the same clipped extract as the `osm` schema.

Build on the development machine after `node ace osm:import`:

```
node ace osrm:build
podman run -d --name osrm -p 127.0.0.1:5000:5000 -v ./storage/osrm:/data:ro,z ghcr.io/project-osrm/osrm-backend:v26.9.0-debian osrm-routed --algorithm ch /data/bandung-raya.osrm
```

`osrm:build` runs `osrm-extract` and `osrm-contract` in the image with Podman (about 50 s; peaks at 1.3 GB RAM). `osrm-routed` uses about 230 MB idle and 250 MB under load, so `compose.yaml` gives it `mem_limit: 384m`. Keep the image tag in `commands/build_osrm.ts` and `compose.yaml` the same: the files only load in the version that built them. The functional test that checks the toll road is avoided runs against this local server (`OSRM_TEST_URL`, default `http://127.0.0.1:5000`) and is skipped when it is not running.

Ship the files to the server (bind mounts are rejected there, so they go into the named volume). Set `OSRM_VOLUME` to `<APP>-osrm` (`podman volume ls` lists it once it exists):

```
tar -C storage/osrm --owner=0 --group=0 --numeric-owner -cf storage/osrm.tar .
scp storage/osrm.tar <server>:
# on the server
OSRM_VOLUME=umimaclean-osrm
podman volume create --ignore "$OSRM_VOLUME"
podman volume import "$OSRM_VOLUME" osrm.tar
systemctl --user restart umimaclean-osrm   # only when the service already runs
```

The `osrm` service has no health check (an empty or broken volume would otherwise block every deploy of the app), so `vps status` does not show whether routing works. Check it on the server with the container names `podman ps --format '{{.Names}}'` lists:

```
podman exec umimaclean-web node -e "fetch('http://osrm:5000/nearest/v1/driving/107.6539748,-6.955631').then((res) => res.text()).then(console.log, console.error)"
podman logs --tail 50 umimaclean-osrm
```

A working server answers `{"code":"Ok",…}`. The log shows `running and waiting for requests` after a start; `Required files are missing` or `osrm-routed stopped, retrying in 60 s` means the volume is empty or was built with another image tag. In `web` the log line is `OSRM request failed` (`vps logs umimaclean`).

`podman volume import` adds files over what is there; after rebuilding with a newer image, empty the volume first (`podman volume rm` while the service is stopped, then create and import again).

### Map tiles (PMTiles)

Every map draws vector tiles from `public/tiles/bandung-raya-<build>.pmtiles`, named after the Protomaps build date (`bandung-raya-20261029.pmtiles`, 87 MB, zoom 0–15, git-ignored and kept out of the image), served by the app's static file server with HTTP range requests; the browser fetches nothing from a map provider. [protomaps-leaflet](https://github.com/protomaps/protomaps-leaflet) 5.1.0 draws them in the `light` flavor (`inertia/lib/location/base_map.ts`, which also holds the attribution "© OpenStreetMap contributors · Protomaps" shown on every map). It needs a Protomaps basemap tileset v4; the pinned build `20261029` is v4.15.2. Data stops at zoom 15 and is drawn sharper up to the maps' zoom 18. When the file is missing (`baseMapUrl` in the shared Inertia props is `null`) the maps show a plain background and the pins and routes still work.

The app looks for the file on every page load (`findBaseMapFiles` in `app/helpers/base_map.ts`). If several builds are present it serves the newest and logs `Several base map files in public/tiles, serving …` once. Because the name changes with every build, `config/static.ts` sends `Cache-Control: public, max-age=31536000, immutable` for `.pmtiles` files, so browsers reuse the tile ranges they already have without asking again; the weak `ETag` and `Last-Modified` stay as before. Other static files keep `max-age=0`.

Build it on the development machine with the [pmtiles CLI](https://github.com/protomaps/go-pmtiles/releases) on `PATH` (a single binary; v1.31.2 was used). It reads only the tiles inside the `osm:import` clip box from the public Protomaps build over range requests (about 90 MB, 1 minute):

```
node ace tiles:extract            # --build=YYYYMMDD for another Protomaps build
```

It writes `public/tiles/bandung-raya-<build>.pmtiles` and, once that succeeds, removes the older builds from `public/tiles`. Before switching to a newer build, check its tileset major version (`pmtiles show public/tiles/bandung-raya-<build>.pmtiles` prints `version`) against the one protomaps-leaflet supports.

Ship it like the routing files. Set `TILES_VOLUME` to `<APP>-tiles` (`podman volume ls` lists it once it exists) and `BUILD` to the build date in the file name:

```
BUILD=20261029
tar -C public/tiles --owner=0 --group=0 --numeric-owner -cf storage/tiles.tar bandung-raya-$BUILD.pmtiles
scp storage/tiles.tar <server>:
# on the server
TILES_VOLUME=umimaclean-tiles
podman volume create --ignore "$TILES_VOLUME"
podman volume import "$TILES_VOLUME" tiles.tar
```

No restart is needed: the next page load picks up the new file. When it replaces an older build, remove the old file from the volume afterwards, once open pages have reloaded (they keep asking for the old name until then). `podman volume import` only adds files, so remove it by hand:

```
# on the server
TILES_DIR=$(podman volume inspect --format '{{.Mountpoint}}' "$TILES_VOLUME")
podman unshare ls -l "$TILES_DIR"
podman unshare rm "$TILES_DIR/bandung-raya-<old build>.pmtiles"
```

After a deploy or a new build, check from outside that range requests pass the proxy unchanged: `206`, a `Content-Range` header, the year-long `Cache-Control` and no `Content-Encoding`. Browsers send `Accept-Encoding: identity` with every range request (Fetch standard), so Traefik's `compress` middleware leaves the tiles alone; the check sends the same header:

```
curl -sI -H 'Accept-Encoding: identity' -r 0-126 https://umimaclean.r3p.dev/tiles/bandung-raya-$BUILD.pmtiles
```
