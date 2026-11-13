# Code Conventions

These conventions define how code is written and maintained in this project. The goal is a codebase that is simple, readable, consistent and easy to maintain.

**The guiding principle: write code that is easy to understand without requiring additional explanations.**

## 0. Project rules

1. **No unexplained workarounds.** A workaround has a short comment saying _why_, what breaks without it, and a link, plus an entry in the decisions log of `docs/ARCHITECTURE.md`. A workaround without an explanation is a bug.
2. **Find the cause, not the symptom.** When something breaks, find out why before changing code, and explain the cause in the report.
3. **Explicit state machines.** Order status (`docs/prd/shared.md` ORD-2, ORD-3) and payment status (PAY-3, PAY-4) each change in exactly one place, with every transition tested.
4. **Outside services can fail.** Fonnte, Midtrans, Turnstile, OSRM and map data each degrade one feature with a clear message when they fail (NFR-4). Tests swap each one for a fake (`app.container.swap`); a test never calls a real outside service.
5. **Small, focused changes.** One concern at a time. No drive-by refactors.
6. **No deprecated code**, ever (§12).

## 1. General principles

- Prefer simplicity over complexity, and readability over cleverness.
- Write code that explains itself through its structure and naming.
- Avoid unnecessary abstractions, indirection and premature optimization.
- Use existing language and framework features instead of reinventing them.
- Do not introduce patterns or utilities without a clear benefit.
- Keep each class and function focused on a single responsibility.
- Prefer straightforward solutions over overly generic implementations.
- Do not add code for hypothetical future requirements.
- **Never use deprecated APIs** (§12).

## 2. Naming

Use descriptive names that communicate intent.

- Avoid abbreviations. Prefer complete words unless the abbreviation is a widely accepted technical term (`ID`, `URL`, `HTTP`, `JSON`, and the framework's own `ctx`, `db`, `props`, `ref`; map coordinates `lat`, `lng`).
- Avoid generic names (`data`, `process`, `handle`, `execute`, `item` when a domain word exists).
- **Use the glossary in `docs/prd/summary.md` §4.** One concept has one name everywhere: `staff`, never `courier` or `kurir` in code; `bill`, never `invoice`; `walk-in order`, never `offline order`. Do not introduce alternative names for the same concept.

```ts
// Avoid
const usr = await findUsr()
const err = new Error('Invalid input')

// Prefer
const user = await findUser()
const error = new Error('Invalid input')
```

**Booleans** use non-imperative names with `is`, `has`, `can` or `should`:

```ts
// Avoid
const active = true
const permission = true

// Prefer
const isActive = true
const hasPermission = true
```

**Functions and methods** say what they do and, in services and models, which entity they act on:

```ts
// Avoid
function process(data) {}
async create() {}

// Prefer
function createAddress(data) {}
async cancelOrderByCustomer() {}
```

Controllers keep the AdonisJS resource method names (`index`, `show`, `create`, `store`, `edit`, `update`, `destroy`) and add a descriptive verb only for actions outside them (`cancel`, `startPayment`).

Stored and wire names keep their spelling even when they break these rules: database columns, JSON setting keys, HTTP and props fields.

## 3. Files and directories

Use **snake_case** for every file and directory, whatever the file exports.

```text
app/
├── controllers/
│   ├── orders_controller.ts
│   └── walk_in_orders_controller.ts
├── services/
│   └── order_service.ts
└── validators/
    └── order.ts
inertia/
├── components/
│   ├── ui/                 ← shadcn components (see the exception below)
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── lib/
│   └── order/schedule.ts
└── pages/
    ├── auth/
    ├── customer/
    ├── staff/
    └── admin/
```

**One exception:** files in `inertia/components/ui/` keep the names the shadcn CLI generates (`dropdown-menu.tsx`), so `shadcn add` can still update them and their imports between each other keep working.

Do not use PascalCase, camelCase or kebab-case anywhere else. React components are still **named** in PascalCase inside their snake_case files.

## 4. JavaScript and TypeScript

- Prefer native language features; do not recreate what the standard library provides.
- `const` over `let` when reassignment is unnecessary. Never `var`.
- Strict type checking. Avoid `any`; use proper types or `unknown`.
- Use type inference when the type is obvious; explicit types at important boundaries (service method results that cross layers, shared props types).
- `import type` for type-only imports. Use the `#…` import aliases from `package.json` on the backend and `~/…` on the frontend, never long relative paths.
- Avoid unnecessary type assertions and duplicated type definitions. Types shared with the frontend come from the backend (transformers, generated registry), not from a hand-written copy.
- Prefer immutable data when mutation is unnecessary.
- Use familiar APIs (`filter`, not a custom `where`), `for...of` for loops, braces on every `if`.

## 5. Properties, getters and methods

- Use **properties** for values that belong to an instance and are available directly.
- Use **methods** for computed or lazily evaluated values (`user.initials()`, `order.number()`).
- Avoid `get`/`set` accessors: property access hides that work is being done. Framework-required accessors (for example a Lucid `@computed` serialization) are acceptable.
- Use `#private` members for internals; `protected` only for injected dependencies. Add `override` on every override. Export only what another file uses.

## 6. Functions and methods

- Keep functions **focused**: one task, told top to bottom.
- Prefer early returns; avoid deeply nested conditionals.
- Avoid unnecessary parameters and wrapper functions that add nothing.
- Return values directly when an extra variable adds nothing.
- **Do not split straightforward logic into several functions without a meaningful reason.** A longer function that reads as one clear sequence is better than five tiny ones the reader has to jump between.

```ts
function displayNameOf(user: User) {
  if (user.name) {
    return user.name
  }

  return user.phone
}
```

## 7. Classes and abstractions

- Create classes when they represent meaningful objects or responsibilities. Do not create classes just to group unrelated functions.
- No unnecessary interfaces or abstract classes. To replace an outside service in tests, swap the concrete class through the AdonisJS container (`app.container.swap`), not through an interface.
- Prefer composition over inheritance. Avoid indirection between layers. Keep public APIs small.

An abstraction should make the code easier to understand, not harder.

## 8. Backend (AdonisJS)

Follow the official AdonisJS, Lucid and VineJS conventions first; these rules add to them.

- **Organized by domain, not by role.** Controllers, services, validators, policies and models live flat in their `app/` folders. When one resource serves clearly different jobs, name the controller after the job (`walk_in_orders_controller.ts`, `payment_reconciliation_controller.ts`), not after a role folder. URL prefixes (`/staf`, `/admin`) and route groups are where roles appear.
- **Controller**: HTTP only. Validate, authorize with Bouncer, call a service (injected with `@inject()`), then render or redirect. No business logic, no queries, no transactions.
- **Service**: one business process across models, transactions and outside APIs. One service per domain (`OrderService`, `PaymentService`, …).
- **Model**: entity rules (`order.canTransitionTo(status)`) and reusable queries as static methods or scopes. No repository layer. A query has one home: a service method never just forwards to a model method.
- **Validators**: VineJS, one per action, named `<action><Resource>Validator` (`createOrderValidator`). All validation messages (Indonesian) live in `start/validator.ts`: one generic message per rule plus field labels, and a `field.rule` message only where the generic one would confuse the user.
- **Errors**: `throw new Exception('…', { status })` from `@adonisjs/core/exceptions` for HTTP errors; a business rule shown under a form field is reported as a validation error on that field. No custom exception classes.
- **Enums**: `app/enums/<name>_enum.ts` exports an `as const` object, a type with the same name, and a `<Name>Label` map (Indonesian) when the UI shows the value. Database columns are plain strings typed through `database/schema_rules.ts`; validators use `vine.enum(Object.values(Enum))`; the frontend imports the same enum file.
- **Migrations**: one `create` migration per table. Each starts with a header comment that explains the table, its non-obvious columns, its indexes and constraints (the one place where a file header is required). Until v1.0.0, never `alter` (`docs/ARCHITECTURE.md` §1.1).
- **Seeders**: one file per domain, run in a fixed order from one index seeder.
- **Money** is whole rupiah in `integer` columns. Never floats.
- **Time**: Luxon `DateTime`, `timestamptz` columns, business dates and display in Asia/Jakarta.
- **Phone numbers**: normalized to `62…` by one shared rule, used by every validator.

## 9. Frontend (Inertia, React, shadcn)

- **Pages by role**: `inertia/pages/{auth,customer,staff,admin}/`, plus `home.tsx`, `legal/` and `errors/`. Role grouping exists only here, in the frontend.
- **Atomic components**: shadcn primitives in `inertia/components/ui/`; everything else in `atoms/` (smallest pieces: logo, status badge), `molecules/` (a few atoms with one job: phone input, quantity stepper), `organisms/` (a section of a page: site header, order summary card, map panel) and `templates/` (page layouts per area). A component lives at the lowest level that fits.
- **Pages own state and navigation.** Non-visual logic used by more than one component lives in `inertia/lib/<feature>/`, not inside components.
- **shadcn on React Aria**: components come from the shadcn CLI with the React Aria base (`style: "aria-vega"` in `components.json`). Compose them instead of rewriting them; change a file in `ui/` only when a composition can't do it, and record why.
- **Icons**: `@tabler/icons-react` only.
- **Data from the server**: through Inertia props and Inertia forms; no client-side fetching where a prop or a form submit does the job. URLs come from the typed route helper (Tuyau), never hand-written strings.

### 9.1 Styling

- Style with **Tailwind utility classes written directly in `className`**. No separate CSS classes, no `@apply`, no CSS modules. Use `style={{ … }}` only for values known at runtime (for example a computed map height).
- **Colors only through shadcn's own theme tokens**: `bg-background`, `text-foreground`, `bg-card`, `bg-primary`, `text-primary-foreground`, `bg-secondary`, `text-secondary-foreground`, `bg-muted`, `text-muted-foreground`, `bg-accent`, `bg-destructive`, `border-border`, `border-input`, `ring-ring`, `chart-1`…`chart-5`, `sidebar-*`. The brand look is set by giving **those existing variables** the brand values in `inertia/css/app.css`.
- **Never add new CSS variables or theme tokens** (no `--umimaclean-black`, no `--brand-*`, no `--status-*`). If a design need truly isn't covered (for example the colors of order-status badges), use Tailwind's built-in palette in one place (one map from status to classes) and ask before adding anything to `app.css`.
- Use Tailwind's default spacing, radius, shadow and type scales. No arbitrary values (`text-[28px]`) unless no scale step fits; then explain why in the review report.
- Default Tailwind breakpoints only, mobile first.

## 10. Comments and documentation

Comments are optional. Write one only when it gives information the code can't.

- Do not repeat what the code says. Prefer better names over explanatory comments.
- Explain **why**, not what. Keep comments short. Remove outdated ones.
- **No file headers** (migrations are the exception, §8). No docblocks on self-explanatory classes, methods or properties.

```ts
// Avoid
/**
 * Creates a new user.
 */
async createUser() {}

// Prefer
async createUser() {}
```

Comments **are** appropriate for non-obvious business rules, important implementation decisions, unexpected behavior, workarounds and framework limitations (with a link), and security considerations. Every workaround also gets an entry in the decisions log of `docs/ARCHITECTURE.md`.

## 11. Error handling

- Handle errors at the boundary that has enough context to decide.
- Never swallow errors silently. Avoid unnecessary `try/catch`.
- Preserve useful information when rethrowing.
- Do not use exceptions for ordinary control flow, and do not return ambiguous values on failure.
- User-facing messages are Indonesian; logs and internal errors are English. A failed outside call that must not break the action (a WhatsApp message) is logged with context and the action continues.

## 12. No deprecated code

- Check the current official documentation before using an API. If it is marked deprecated (in the docs, in its types with `@deprecated`, or by a runtime warning), use its replacement.
- ESLint enables `@typescript-eslint/no-deprecated` (type-aware), and `npm run lint` must pass.
- Deprecation warnings in the dev server, the build or the test run are treated as failures to fix, not noise.

## 13. Formatting

Follow the configured formatter and linter (`@adonisjs/prettier-config`, the project ESLint config). Do not hand-format against them.

## 14. Dependencies and tooling

- Prefer built-in platform and framework capabilities when they are sufficient.
- No dependency for trivial functionality. Every new one is justified in `docs/DEPENDENCIES.md`, stable and actively maintained.
- Keep the toolchain as simple as reasonably possible.

## 15. Language

The application is **Indonesian only**: every page, label, message, validation error and WhatsApp text. There is no translation layer and no language switcher. Code, comments, docs and commit messages are English.

## 16. Instructions for AI agents

When creating or modifying code:

- Read the existing implementation and these conventions before changing anything.
- Prefer modifying existing code over introducing new abstractions.
- Use descriptive, consistent naming from the glossary.
- Do not add comments or file headers that the code doesn't need.
- Do not over-engineer straightforward requirements, and avoid unrelated changes.
- Preserve existing behavior unless explicitly instructed otherwise.
- When several solutions are valid, choose the simplest one consistent with the existing codebase.
- Do not introduce patterns, abstractions or dependencies just because they are common in other projects.
