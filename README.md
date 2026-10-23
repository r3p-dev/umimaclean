# Umima Clean

Shoe, bag and helmet cleaning service with pickup and delivery in Bandung Raya, built with AdonisJS, Inertia and React.

## Scheduled jobs

Two ace commands run outside the web server, started by systemd user timers that run them inside the app container (`umimaclean-web`) with `podman exec`.

| Timer | When | What it does |
| --- | --- | --- |
| `umimaclean-remind-payment.timer` | every 15 minutes | `node ace orders:remind-payment`: sends due WhatsApp payment reminders for unpaid online orders (24 hours after the bill, then every 2 days, only between 10:00 and 15:00 Asia/Jakarta). Safe to run repeatedly; a failed send is retried on the next run. Never calls Midtrans. |
| `umimaclean-prune-proofs.timer` | daily | `node ace proofs:prune`: deletes proof photos older than 90 days. |

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
