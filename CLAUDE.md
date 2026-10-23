# Umima Clean (skripsi)

Shoe, bag and helmet cleaning with pickup and delivery in Bandung Raya. UI language is Indonesian.

Stack: AdonisJS 7 + Inertia + React 19, PostgreSQL + PostGIS, Lucid, VineJS, Bouncer, Transmit, Fonnte (WhatsApp), Midtrans Core API (QRIS), Cloudflare Turnstile, npm. Frontend: Tailwind CSS v4, shadcn/ui on React Aria (`aria-vega`), Tabler icons.

## Agent rules

- Git: only read-only commands (`status`, `diff`, `log`, `show`). Never `add`, `rm`, `reset`, `restore`, `checkout`, `stash`, `commit`, `push`; ask the user to do it.
- Never send personal or identifying data (email, name, phone, tokens) to an outside service without asking first. Use a neutral User-Agent (`UmimaClean-skripsi/1.0`) and say which service and what is sent before any new kind of outside request.
- Stop and ask when something turns out different from the agreed plan.
- `database/schema.ts` is generated: rebuild it with `NODE_ENV=test node ace migration:fresh` and format it with Prettier; never edit or restore it by hand.

## Business rules

- Roles (`Role` enum): `customer` (Pelanggan), `staff` (Staf, one courier who also works the store) and `admin` (Owner). Everyone signs in with WhatsApp number + password; `/masuk` accepts only customers, `/staf/masuk` staff and owner.
- WhatsApp to customers: exactly five messages, all built in `app/helpers/whatsapp_text.ts` and sent by `OrderService`/`ReminderService` through `FonnteService`: order received, courier on the way, bill (walk-ins: "Rincian: …", online: "Rincian dan pembayaran: …"), payment reminder, cancelled by the store. Staff and owner get none. OTP codes are separate (`OtpService`). A failed or crashing send is logged and never fails the action.
- Payment reminders (`node ace orders:remind-payment`, every 15 minutes): online orders awaiting payment with no paid payment, first 24 hours after the bill, then every 2 days, only 10:00–15:00 Asia/Jakarta, until paid. Only a sent message is counted. Never calls Midtrans.
- Walk-ins (`source = store`) pay at the counter (cash, EDC or counter QRIS); they get no reminders.
- Midtrans is charged only when the customer presses pay (`PaymentService.startQris`); a QR lives 15 minutes.
- Addresses: at most 3 per customer, one primary (partial unique index). Orders copy pickup and delivery into `order_addresses`.
- Order URL `/pesanan/:id`, shown as `UMC-00042` (`Order.numberOf`). The signed-in customer sees it directly; anyone else types the last 4 digits of the order's phone (5 wrong tries per 15 minutes per IP and per order, 20 per order per 24 hours), which unlocks it for that session only.
- Service areas: the 80 BPS kecamatan of Kota Bandung, Kota Cimahi, Kabupaten Bandung and Kabupaten Bandung Barat in `service_areas` (seeded from `database/data/service_areas.geojson`). The owner switches them on/off in Pengaturan → Area layanan. Every pin is checked with `ServiceArea.contains` (PostGIS `ST_Contains` on active areas): address create/update, online order review and placement (saved addresses are re-checked), walk-in delivery. Orders already placed are not re-checked. The map pin asks `GET /area?lat&lng` for instant feedback; Nominatim/Photon run only in the browser for address search and the street label.
- Order status changes only through `OrderService.transition` (checks `ORDER_TRANSITIONS`, appends `order_events`, logs staff/owner actions in `activity_logs`, broadcasts on Transmit after commit). Pickup slots have an owner-set capacity, re-checked under a Postgres advisory lock.

## Layers

- **Controller**: HTTP only. Validate, authorize with Bouncer, call one service or a model's static query, render or redirect. No business logic, no transactions.
- **Service**: a business process across models, transactions and outside APIs. One per domain, flat in `app/services/`.
- **Model**: entity rules (`order.canTransitionTo`) and simple static queries or scopes (`ServiceArea.contains`, `Order.findForOwner`).
- Chain rule: a service calls at most one other domain service (`TaskService`, `BillingService`, `PaymentService` → `OrderService`; `StaffService` → `AccountService`). The outside-API clients `FonnteService`, `MidtransGateway` and `TurnstileService` call nothing else.
- No abstract base classes, no repositories, no interfaces with one implementation.
- Role and ownership rules live in Bouncer: abilities in `app/abilities/main.ts`, policies `OrderPolicy`, `CustomerAddressPolicy`, `OtpFlowPolicy`.

## Services

- `AccountService`: sign in/out (login limit), `changePasswordWithCurrent` (profile), `resetPasswordAfterOtp` (forgot password), `signOutOtherDevices`, `endSessions` (remember-me tokens and tagged sessions, optionally keeping the current one).
- `AddressService`: the address book (max 3, primary, area check).
- `AreaService`: `check` for `GET /area`, owner `search` and `setActive` (logged).
- `BillingService`: price list (owner CRUD, soft delete) and the bill from an inspection.
- `FonnteService`: the only HTTP call to Fonnte; without `FONNTE_TOKEN` it logs the message (outside production).
- `MidtransGateway`: Midtrans Core API over `fetch` (charge, status, webhook signature).
- `OrderService`: order lifecycle (place, walk-in, cancel, owner bulk move/cancel), transitions, slots, guest tracking unlock, customer WhatsApp messages.
- `OtpService`: WhatsApp OTP codes, their limits and the OTP flow state in the session.
- `PaymentService`: QRIS start/refresh/webhook, counter payments, owner corrections.
- `ReminderService`: `sendDue(now)` for the payment reminders.
- `ReportService`: owner reports, costs, activity log, customer list.
- `StaffService`: owner-managed staff accounts.
- `TaskService`: courier trips (pickup and delivery), inspection start, washing, collection, staff counts and history.
- `TurnstileService`: Cloudflare Turnstile check.

## Conventions

- No comments in any file, except the header comment of each migration.
- Validation messages live only in `start/validator.ts`: one generic message per rule plus `fields` labels; add a `field.rule` key only when the generic text would confuse the user. Validators are named `<action><Resource>Validator`.
- Errors: `throw new Exception('…', { status })` from `@adonisjs/core/exceptions` for HTTP errors (404 etc.); `fieldError(field, message, rule)` from `#validators/shared/field_error` for a business rule shown under a form field. No custom exception classes.
- Migrations: one `create` per table, never `alter`. Each starts with a header comment explaining the table, non-obvious columns, indexes and constraints.
- Seeders: one file per domain in `database/seeders/`, run in a fixed order from `database/seeders/main/index_seeder.ts` (user, address, service, setting, service_area, order, operating_cost).
- Client IP: `request.ip()` reads `X-Forwarded-For` only from `TRUSTED_PROXIES` (default `loopback,uniquelocal`, `config/app.ts`), so per-IP limits see the real client behind Traefik.
- Rate limits: HTTP endpoint limits are route middleware in `start/limiter.ts` (`GET /area`, 60 per minute per IP). Business limits stay in their service: login (`AccountService`, per phone and IP), OTP (`OtpService`: 60 s resend, 5 per number and 20 per IP per hour), tracking digits (`OrderService`, plus a daily cap per order), QRIS charges (`PaymentService`, 5 per order per 15 minutes).
- Enums: `app/enums/<name>_enum.ts` exports an `as const` object, a type with the same name and a `<Name>Label` map when the UI shows the value. DB columns are plain strings typed through `database/schema_rules.ts`; validators use `vine.enum(Object.values(X))`; the frontend imports `@enums/<name>_enum`.
- Style (Harminder Virk): full words (`ctx`, `lat`, `lng`, `db`, `props`, `ref` are fine); booleans `isX`/`hasX`/`canX`/`shouldX`; braces on every `if`; `for...of`; no `get`/`set` accessors; `#private` members (`protected` only for injected dependencies); `override` on every override. Export only what another file uses.
- Stored and wire names keep their spelling even when they break that style: DB columns, JSON settings (`PickupSlotSetting.on`) and HTTP/props fields (`remember`, `terms`, `logoutOthers`, `q`, `active`).
- File names snake_case; shadcn files in `inertia/components/ui/` stay kebab-case. Prettier (single quotes, no semicolons) on touched files.
- Tests: `tests/support/app.ts` swaps `FonnteService`, `TurnstileService` and `MidtransGateway` for fakes, resets the database before each test (keeping `spatial_ref_sys`) and seeds two fixture service areas.

## Frontend

- Read `docs/design-system.md` (git-ignored, local) before writing UI; artboards are in `docs/design/`.
- Tokens only in `inertia/css/app.css`; use token utilities, no raw colors. New scale tokens (`--text-*`, `--radius-*`, `--shadow-*`, `--spacing-*`) also go in `inertia/lib/shared/utils.ts`.
- Components: shadcn primitives in `inertia/components/ui/`, the rest in `inertia/components/{atoms,molecules,organisms,templates}`. Pages own state and navigation; logic lives in `inertia/lib/<feature>/`, never in components.
- Pages by role: `inertia/pages/{auth,customer,staff,admin}/` (landing `pages/home.tsx`). Routes per role in `start/routes/{auth,customer,staff,admin}.ts`; shared ones in `start/routes.ts`. Run `node ace codegen` after changing routes.
- Layouts: `CustomerLayout`, `AccountLayout` (+ `ProfileShell`), `AuthLayout`, `FlowLayout`, `StaffLayout` + `StaffTopBar`, `AdminLayout` + `AdminPageHeader`; owner tables use `useDataTable`.
- Breakpoints: base, `sm:` (600px), `lg:` (1024px); no `md:` for layout. Icons from `@tabler/icons-react` only.
- Live updates: Transmit channels `orders/:id`, `staff/queues`, `admin/orders` (`start/transmit.ts`); pages call `useLiveReload`.
- Browser storage only for conveniences: the staff map-app preference and the unsent walk-in draft.

## Commands

- `npm run dev` (http://localhost:3333)
- `node ace migration:fresh --seed` (dev database), `node ace db:seed`
- `node ace orders:remind-payment`, `node ace proofs:prune` (systemd timers, see `README.md`)
- `npm test` (unit, functional, browser; `.env.test`, port 3334), `npm run typecheck`, `npm run lint`
- TypeScript stays on 6.x (`@adonisjs/assembler` and `typescript-eslint` don't accept 7 yet).
