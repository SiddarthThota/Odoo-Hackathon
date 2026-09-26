# StockSense Operations Management Service

This repository contains only the StockSense Operations Management Service described by `StockSense-Operations-Service-Spec.md`.

## Scope

Owned here:
- Receipts
- Delivery Orders
- Internal Transfers
- Stock Adjustments
- Move History (append-only ledger)
- Operation status and metadata
- Operation dashboard statistics

Not owned here:
- Product master data
- Warehouses / locations
- Current stock quantities / availability
- Reorder rules
- Inventory valuation

Those remain in the separate Inventory Service. Operations stores references such as `productId`, `warehouseId`, and `locationId` and calls the Inventory Service for stock changes.

## Stack

- NestJS 12
- TypeScript strict mode
- PostgreSQL
- Prisma ORM 7.10
- JWT bearer authentication
- `class-validator` / `class-transformer`
- REST + Swagger/OpenAPI
- Docker / Docker Compose

Prisma 7 uses a `prisma7.config.ts` file for the database URL, and the runtime PostgreSQL connection uses Prisma's `@prisma/adapter-pg` driver adapter.

## Local setup without Docker

1. Install Node.js 24+ and PostgreSQL.
2. Copy `.env.example` to `.env`.
3. Use a PostgreSQL database for `DATABASE_URL` (the Docker Compose setup below creates one automatically).
4. Replace the development `JWT_SECRET` before any non-local deployment.
5. Install dependencies:

```bash
npm install
```

6. Generate Prisma Client:

```bash
npm run db:generate
```

7. Apply migrations and install the MoveHistory immutability trigger:

```bash
npm run db:setup
```

8. Start the API:

```bash
npm run start:dev
```

API base: `http://localhost:3001/api/v1/operations`

Health: `http://localhost:3001/health`

Swagger: `http://localhost:3001/api/docs`

## Docker quick start

This is the most reproducible Operations-only setup. It starts PostgreSQL and the Operations Service, with the development mock Inventory client enabled.

```bash
docker compose up --build
```

Then open:

- API: `http://localhost:3001/api/v1/operations`
- Health: `http://localhost:3001/health`
- Swagger: `http://localhost:3001/api/docs`

The compose file intentionally does not create a Product, Warehouse, Location or Stock database for the Operations Service.

## Fastest local demo

The Operations Service can use a development-only in-process mock Inventory client. This does not create persistent stock tables in the Operations database and exists only to let you exercise the operation workflows before the real Inventory Service is connected.

In `.env`:

```env
INVENTORY_SERVICE_MODE=mock
AUTH_DEV_BYPASS=true
```

`AUTH_DEV_BYPASS` is rejected when `NODE_ENV=production`.

For a real deployment, use a real JWT and the HTTP Inventory Service:

```env
INVENTORY_SERVICE_MODE=http
AUTH_DEV_BYPASS=false
INVENTORY_SERVICE_URL=http://inventory-service:4000
```

## JWT

Production requests use:

```http
Authorization: Bearer <jwt>
```

The payload must contain:

```json
{
  "sub": "user-id",
  "role": "InventoryManager"
}
```

or `WarehouseStaff`.

For local development, after setting `JWT_SECRET`:

```bash
npm run token:dev -- InventoryManager dev-user
```

## API surface

All operation routes use `/api/v1/operations`.

### Receipts

```text
GET    /receipts
GET    /receipts/:id
POST   /receipts
PATCH  /receipts/:id
POST   /receipts/:id/submit
POST   /receipts/:id/validate
POST   /receipts/:id/cancel
DELETE /receipts/:id
```

Lifecycle implemented:

```text
DRAFT -> WAITING -> READY -> DONE
                     \-> CANCELED
```

`POST /receipts/:id/submit` records `WAITING` and immediately performs the documented readiness precondition. If every line has a received quantity, the transaction finishes at `READY`; otherwise it remains `WAITING`.

### Delivery Orders

```text
GET    /deliveries
GET    /deliveries/:id
POST   /deliveries
PATCH  /deliveries/:id
POST   /deliveries/:id/pick
POST   /deliveries/:id/pack
POST   /deliveries/:id/validate
POST   /deliveries/:id/cancel
```

Pick moves `DRAFT -> WAITING`, pack moves `WAITING -> READY`, and validate calls the Inventory Service decrement operation before marking the document `DONE`.

### Internal Transfers

```text
GET    /transfers
GET    /transfers/:id
POST   /transfers
POST   /transfers/:id/validate
POST   /transfers/:id/cancel
```

Validation uses one Inventory Service `POST /stock/move` call so a relocation is atomic from the Operations Service perspective.

### Stock Adjustments

```text
GET    /adjustments
GET    /adjustments/:id
POST   /adjustments
POST   /adjustments/:id/apply
```

On creation, `recordedQty` is always fetched from the Inventory Service and never accepted from the client. `delta = countedQty - recordedQty`.

### Move History

```text
GET /move-history
GET /move-history/:id
```

No public write endpoint exists. The database safety trigger rejects UPDATE/DELETE against `MoveHistory`.

### Statistics

```text
GET /stats/summary
GET /stats/by-status
GET /stats/recent-activity?limit=10
```

## Inventory Service contract used by this implementation

The Operations Service calls:

```text
POST /stock/increment
POST /stock/decrement
POST /stock/move
POST /stock/adjust
GET  /stock/quantity?productId=...&locationId=...
```

The provided request payloads include `operationId`, which is used as the idempotency key header (`x-idempotency-key`) for downstream stock mutation calls. The Operations specification names the stock mutation endpoints, while the exact payload shape and quantity lookup path are integration-contract details that should be matched with the Inventory Service implementation.

## Error semantics

- `400` validation errors
- `401` missing/invalid JWT
- `403` role restriction
- `404` missing operation
- `409` invalid state or downstream stock conflict
- `502` Inventory Service unavailable/rejected for non-conflict failures

## Tests / verification

Run:

```bash
npm run typecheck
npm run test:unit
npm run verify:static
npm run safety-check
```

For a live local workflow run, with `AUTH_DEV_BYPASS=true` and `INVENTORY_SERVICE_MODE=mock`, use the included PowerShell smoke test:

```powershell
.\scripts\smoke-api.ps1
```

Or:

```bash
npm run verify
npm run test:db-safety
```

`verify:static` checks the required source files, required routes, the Prisma ownership boundary, the MoveHistory uniqueness safeguard, and source-tree cleanliness.

## Design safeguards

- Operations never persist Product, Warehouse, Location, or live Stock models.
- Stock-changing validation always calls the Inventory Service before local `DONE` state is written.
- If the Inventory Service rejects a validation call, the local operation remains in its prior non-terminal state.
- Move History is append-only at both application and PostgreSQL-trigger levels.
- Operation references use an atomic database-backed counter, avoiding count-based reference collisions under concurrent creates.
- List APIs use page/limit pagination with a hard maximum of 100 rows per request.
- Status transitions and terminal-state mutation checks are enforced in services, not just the UI.
- Global DTO validation rejects unexpected fields and invalid numeric/date input.
- Rate limiting is enabled globally with an in-memory throttler for this single-service deployment.

## Verification artifacts

- `docs/TEST-MATRIX.md` — operation-by-operation test matrix.
- `docs/TRACEABILITY.md` — requirement-to-implementation mapping and integration assumptions.
- `docs/VERIFICATION-REPORT.md` — checks performed before packaging and the runtime-environment limitation.

## Windows clean-start note

Extract this archive into a new folder. Do not merge it into an existing `stocksense-backend` directory. This project is the Operations Service and is intentionally independent of the frontend repository tree.

The framework dependencies are aligned to Nest 12; in particular `@nestjs/config` is `12.0.1` to match the Nest 12 packages.
