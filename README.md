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

The seeder logs the demo accounts and their one shared random password. Without `FONNTE_TOKEN` WhatsApp messages are written to the log instead of sent; without `MIDTRANS_SERVER_KEY` QRIS is shown as unavailable. The Turnstile keys in `.env.example` are Cloudflare's test keys.

```
npm test
npm run typecheck
npm run lint
```

## Production image

There is no Containerfile yet. When one is added, it must be multi-stage:

1. Build stage: a full `npm ci` (dev dependencies included), then `node ace build`. Vite, the Tailwind build (which reads `shadcn/tailwind.css`) and `@adonisjs/assembler` need the dev dependencies.
2. Final stage: copy `build/` and run only `npm ci --omit=dev` inside it, then `node bin/server.js`.

`shadcn`, `vite`, `@adonisjs/assembler` and the other build tools are dev dependencies and must not be needed at runtime. Don't add `--omit=optional` without a build and boot test: it also drops platform-specific optional packages.

### Known audit finding

`npm audit` reports the braces advisory [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) (stack exhaustion on deeply nested glob patterns), through `fast-glob` and `micromatch`. It is only used by build and dev tooling (`@adonisjs/assembler`, `hot-hook`, ESLint, the shadcn CLI) on their own patterns, never on request data, so it is not reachable at runtime. No fixed braces version exists yet; re-check with `npm audit` later. Don't run `npm audit fix --force`: it downgrades AdonisJS to 5.x.

## Behind the reverse proxy

In production every request reaches the app through Traefik. The app takes the client IP from `X-Forwarded-For` only when the request comes from a trusted proxy address, set in `TRUSTED_PROXIES` (comma-separated [proxy-addr](https://www.npmjs.com/package/proxy-addr) values). The default `loopback,uniquelocal` trusts 127.0.0.0/8, ::1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 and fc00::/7, which covers the Podman network Traefik uses; a narrower value such as `10.89.0.0/24` also works. Requests from any other address keep their own IP and the header is ignored.

The per-IP limits (login, OTP, tracking digits, `GET /area`) depend on this. Two things to keep true on the server:

- Do not publish the app container's port; only Traefik should reach it.
- Traefik itself must see the real client address. Check that its access log shows public client IPs, not a Podman gateway address (rootless Podman with `pasta` keeps the source address).

## Scheduled jobs

Two ace commands run outside the web server, started by systemd user timers that run them inside the app container (`umimaclean-web`) with `podman exec`.

| Timer                             | When             | What it does                                                                                                                                                                                                                                                                     |
| --------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `umimaclean-remind-payment.timer` | every 15 minutes | `node ace orders:remind-payment`: sends due WhatsApp payment reminders for unpaid online orders (24 hours after the bill, then every 2 days, only between 10:00 and 15:00 Asia/Jakarta). Safe to run repeatedly; a failed send is retried on the next run. Never calls Midtrans. |
| `umimaclean-prune-proofs.timer`   | daily            | `node ace proofs:prune`: deletes proof photos older than 90 days.                                                                                                                                                                                                                |

The unit files are in [`deploy/systemd/`](deploy/systemd/). Install them on the server as user units:

```
cp deploy/systemd/umimaclean-* ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now umimaclean-remind-payment.timer umimaclean-prune-proofs.timer
systemctl --user list-timers 'umimaclean-*'
```

Read their logs:

```
journalctl --user -u umimaclean-remind-payment.service -n 50
journalctl --user -u umimaclean-prune-proofs.service -n 50
```

`Persistent=true` runs a missed job once after the server was down. The reminder command checks the 10:00–15:00 window itself, so its timer runs around the clock.

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
