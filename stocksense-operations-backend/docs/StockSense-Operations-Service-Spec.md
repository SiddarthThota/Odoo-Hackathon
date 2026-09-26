# StockSense — Operations Management Service
### Backend Implementation Specification (v1.0)

---

## 0. Context: What StockSense Is

StockSense is a modular **Inventory Management System (IMS)** that digitizes stock operations for businesses, replacing manual registers, spreadsheets, and scattered tracking. It serves two primary user roles:

| Role | Responsibilities |
|---|---|
| **Inventory Manager** | Manages incoming & outgoing stock, approves operations, reviews KPIs |
| **Warehouse Staff** | Performs transfers, picking, shelving, and physical counting |

The full product includes authentication (signup/login, OTP password reset), a KPI dashboard, product management, and five operational workflows: **Receipts, Delivery Orders, Internal Transfers, Stock Adjustments,** and **Move History**.

This document specifies **only the Operations Management Service** — one microservice within that larger system.

---

## 1. Service Mandate

Build a standalone, Dockerized **NestJS REST API** that manages the lifecycle of all stock *movements* (as opposed to stock *state*, which lives elsewhere). It communicates with:

1. The StockSense **frontend** (developed independently)
2. A separate **Inventory Service** (owns products, warehouses, locations, and live stock quantities)

The Operations Service must expose stable, versioned REST APIs for:

- Receipts (incoming stock)
- Delivery Orders (outgoing stock)
- Internal Transfers
- Stock Adjustments
- Move History (the audit ledger)
- Operation status transitions
- Operation dashboard statistics

---

## 2. Strict Service Boundary

Microservice discipline is the most important constraint in this spec. Violating it (e.g., caching stock counts locally, or storing full product objects) creates data-consistency bugs that are expensive to unwind later.

### 2.1 This service OWNS

| Domain | Notes |
|---|---|
| Receipts | Full lifecycle: draft → waiting → ready → done/canceled |
| Deliveries | Same lifecycle pattern, outgoing direction |
| Transfers | Internal, location-to-location |
| Adjustments | Reconciliation between recorded vs. counted stock |
| Move History | Immutable ledger of every stock-affecting event |
| Operation status & metadata | State machine, timestamps, actors, notes |
| Operation dashboard statistics | Aggregates *of operations*, not of stock levels |

### 2.2 This service DOES NOT own

- Product master data (name, SKU, category, unit of measure)
- Warehouses / locations
- Current stock quantities or availability
- Reorder rules
- Inventory valuation

These remain the responsibility of the **Inventory Service**, which is the single source of truth. The Operations Service stores **references only** (`productId`, `warehouseId`, `locationId` as UUIDs/strings) and calls the Inventory Service to read or mutate stock — it never persists a local copy of stock state.

> **Rule of thumb:** if a field describes *what exists*, it belongs to Inventory. If a field describes *what happened*, it belongs to Operations.

---

## 3. Technology Stack

| Layer | Choice |
|---|---|
| Framework | NestJS |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (bearer tokens, validated against shared auth service/secret) |
| Validation | `class-validator` + `class-transformer` (DTO-based) |
| API style | REST |
| Docs | Swagger / OpenAPI (auto-generated from decorators) |
| Containerization | Docker |
| Orchestration | Docker Compose (local/dev); Kubernetes-ready for prod |
| Inter-service calls | HTTP (via `HttpModule`/Axios) or a message queue for async stock-update events (recommend: emit events, don't block on sync calls where possible) |

---

## 4. Architecture

```
                              FRONTEND
                                  │
                                  │ REST (JWT)
                                  ▼
                    ┌───────────────────────────┐
                    │   Operations Service       │
                    │        (NestJS)            │
                    │ ─────────────────────────  │
                    │ Receipts | Deliveries       │
                    │ Transfers | Adjustments     │
                    │ Move History | Stats        │
                    └──────────┬────────────┬─────┘
                               │            │
                               ▼            ▼
                       PostgreSQL     Inventory Service
                      (Operations DB)  (Products/Warehouses/
                                         Stock — source of truth)
                                              │
                                              ▼
                                        Stock changes applied
```

**Interaction pattern:** when an operation (receipt/delivery/transfer/adjustment) is **validated**, the Operations Service calls the Inventory Service to apply the resulting stock delta. If that call fails, the operation must roll back to its prior status (see §8.4, Saga/compensation pattern) rather than silently succeeding with inconsistent state.

---

## 5. Domain Model

All five resources share a common shape and a common status lifecycle, which should be modeled as a shared base (either via Prisma's model inheritance conventions or a shared interface) to avoid duplicated logic.

### 5.1 Shared Status Lifecycle

```
DRAFT → WAITING → READY → DONE
                        ↘ CANCELED
```

| Status | Meaning |
|---|---|
| `DRAFT` | Created, not yet submitted for processing |
| `WAITING` | Submitted; waiting on a precondition (e.g., stock availability check) |
| `READY` | Precondition met; awaiting final validation |
| `DONE` | Validated — stock delta has been applied via Inventory Service |
| `CANCELED` | Terminated before completion; no stock effect |

### 5.2 Entity: Receipt

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | PK |
| `referenceNo` | string | Human-readable, auto-generated (e.g. `REC-2026-0001`) |
| `supplierRef` | string | Reference to external supplier entity |
| `warehouseId` | string | Reference to Inventory Service |
| `status` | enum | See §5.1 |
| `lines` | `ReceiptLine[]` | See below |
| `scheduledDate` | DateTime | |
| `validatedAt` | DateTime? | Set when moved to `DONE` |
| `createdBy` / `validatedBy` | string | User ID references |
| `notes` | string? | |
| `createdAt` / `updatedAt` | DateTime | |

**ReceiptLine:** `productId`, `expectedQty`, `receivedQty`, `unitOfMeasure` (denormalized display value only, not owned).

### 5.3 Entity: Delivery Order

Mirrors Receipt, with `customerRef` instead of `supplierRef`, and a two-step process: **Pick → Pack → Validate**. Add a `pickedAt` / `packedAt` timestamp pair to `DeliveryLine` to support partial fulfillment tracking.

### 5.4 Entity: Internal Transfer

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `referenceNo` | string | e.g. `INT-2026-0001` |
| `sourceLocationId` | string | |
| `destinationLocationId` | string | |
| `status` | enum | |
| `lines` | `TransferLine[]` | `productId`, `quantity` |
| `createdAt` / `updatedAt` | DateTime | |

Net stock is unchanged; only location attribution changes. The Inventory Service call here is a **move**, not an increment/decrement.

### 5.5 Entity: Stock Adjustment

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `productId` | string | |
| `locationId` | string | |
| `recordedQty` | number | Snapshot at time of count, from Inventory Service |
| `countedQty` | number | Entered by user |
| `delta` | number | `countedQty - recordedQty` (computed) |
| `reason` | string? | e.g. "damaged", "miscount", "theft" |
| `status` | enum | |
| `createdBy` | string | |

### 5.6 Entity: Move History (Ledger)

An **append-only, immutable** table. Every state transition that results in a stock delta (Receipt validated, Delivery validated, Transfer completed, Adjustment applied) writes exactly one row here. This is the audit trail and the backbone for the "Move History" screen and for the dashboard's recent-activity feed.

| Field | Type | Notes |
|---|---|---|
| `id` | UUID | |
| `operationType` | enum | `RECEIPT` \| `DELIVERY` \| `TRANSFER` \| `ADJUSTMENT` |
| `operationId` | UUID | FK to the source operation |
| `productId` | string | |
| `quantityDelta` | number | Signed |
| `fromLocationId` | string? | Null for pure receipts |
| `toLocationId` | string? | Null for pure deliveries |
| `performedBy` | string | |
| `occurredAt` | DateTime | |

Never allow `UPDATE` or `DELETE` on this table at the application layer — enforce via a Postgres rule/trigger or a repository method that only ever `INSERT`s.

---

## 6. REST API Surface

All endpoints are prefixed `/api/v1/operations`. All mutating endpoints require a valid JWT; role-based guards (`InventoryManager`, `WarehouseStaff`) restrict validation/cancellation actions to managers where appropriate.

### 6.1 Receipts
```
GET    /receipts                 list (filterable: status, warehouseId, dateRange)
GET    /receipts/:id             detail
POST   /receipts                 create (DRAFT)
PATCH  /receipts/:id             update lines/metadata (DRAFT/WAITING only)
POST   /receipts/:id/submit      DRAFT → WAITING
POST   /receipts/:id/validate    → DONE (triggers Inventory Service stock +Δ)
POST   /receipts/:id/cancel      → CANCELED
DELETE /receipts/:id             hard delete (DRAFT only)
```

### 6.2 Delivery Orders
```
GET    /deliveries
GET    /deliveries/:id
POST   /deliveries
PATCH  /deliveries/:id
POST   /deliveries/:id/pick
POST   /deliveries/:id/pack
POST   /deliveries/:id/validate  → DONE (stock -Δ)
POST   /deliveries/:id/cancel
```

### 6.3 Internal Transfers
```
GET    /transfers
GET    /transfers/:id
POST   /transfers
POST   /transfers/:id/validate   → DONE (stock relocated, net zero)
POST   /transfers/:id/cancel
```

### 6.4 Stock Adjustments
```
GET    /adjustments
GET    /adjustments/:id
POST   /adjustments              includes recordedQty snapshot + countedQty
POST   /adjustments/:id/apply    → DONE (stock corrected by delta)
```

### 6.5 Move History
```
GET    /move-history              filterable: productId, operationType, dateRange, locationId
GET    /move-history/:id
```
(Read-only — no create/update/delete endpoints exposed.)

### 6.6 Dashboard / Statistics
```
GET    /stats/summary             pending receipts, pending deliveries, scheduled transfers, adjustments today
GET    /stats/by-status           counts grouped by status, optionally per document type
GET    /stats/recent-activity     last N move-history entries (feeds dashboard feed)
```

### 6.7 Shared Query Conventions
- Pagination: `?page=1&limit=25`
- Filtering: `?status=WAITING&warehouseId=...&from=...&to=...`
- Sorting: `?sortBy=createdAt&order=desc`
- All list endpoints return `{ data: [...], meta: { page, limit, total } }`

---

## 7. Business Logic & Workflows

### 7.1 Receipt Validation Flow
1. User submits receipt (`DRAFT → WAITING`).
2. System checks preconditions (e.g., all lines have `receivedQty` set) → `READY`.
3. Manager validates (`READY → DONE`):
   - Call Inventory Service: `POST /stock/increment` with line deltas.
   - On success: write `MoveHistory` rows, set `validatedAt`.
   - On failure: **do not** transition status; return the Inventory Service error to the caller.

### 7.2 Delivery Flow
1. Pick items → `pickedAt` set per line.
2. Pack items → `packedAt` set per line.
3. Validate → call Inventory Service `POST /stock/decrement`; guard against decrementing below zero (Inventory Service is authoritative on this check, but Operations should surface a clear 409 if it's rejected).

### 7.3 Transfer Flow
1. Create with source/destination locations.
2. Validate → call Inventory Service `POST /stock/move` (atomic relocation, not two separate calls) to avoid a window where stock appears to vanish.

### 7.4 Adjustment Flow
1. On creation, fetch `recordedQty` live from Inventory Service and snapshot it (don't trust a stale client-supplied value).
2. Compute `delta = countedQty - recordedQty`.
3. On apply, call Inventory Service `POST /stock/set` or `/stock/adjust` with the delta; log to Move History with `reason`.

### 7.5 Failure Handling Between Services
Because this is a distributed system, a validate action spans two services. Recommended pattern:
- Treat the local status transition and the Inventory Service call as a single logical unit using an **outbox pattern**: write the intended stock event to a local `outbox` table in the same DB transaction as the status change, then have a background worker deliver it to the Inventory Service with retries.
- If synchronous calls are used instead, wrap in a **compensating transaction**: on Inventory Service failure, revert local status to its prior value and return an error — never leave an operation marked `DONE` without a confirmed stock effect.

---

## 8. Non-Functional Requirements

### 8.1 Validation
- Every DTO validated via `class-validator` (`@IsUUID`, `@IsPositive`, `@IsEnum`, etc.).
- Reject negative quantities, empty line arrays, and invalid status transitions (enforce the state machine in a guard/service method, not just in the controller).

### 8.2 Error Handling
- Use NestJS exception filters for consistent error shape: `{ statusCode, message, error, timestamp, path }`.
- Distinguish `400` (validation), `404` (not found), `409` (invalid state transition / stock conflict), `502` (downstream Inventory Service failure).

### 8.3 Security
- JWT validated on every request via a global guard; public routes explicitly whitelisted.
- Role-based access control for validate/cancel actions.
- Rate limiting on list endpoints (e.g., `@nestjs/throttler`).

### 8.4 Observability
- Structured logging (correlation ID per request, propagated to the Inventory Service call).
- Health check endpoint (`/health`) for Docker/orchestration liveness probes.

### 8.5 Testing
- Unit tests per service class (mock Prisma + mock Inventory Service client).
- Integration tests for each status-transition endpoint, including the failure/rollback path in §7.5.
- E2E test for one full flow: create receipt → submit → validate → assert Move History entry created.

---

## 9. Suggested Project Structure

```
operations-service/
├── src/
│   ├── receipts/
│   │   ├── receipts.controller.ts
│   │   ├── receipts.service.ts
│   │   ├── dto/
│   │   └── entities/
│   ├── deliveries/
│   ├── transfers/
│   ├── adjustments/
│   ├── move-history/
│   ├── stats/
│   ├── inventory-client/        # HTTP client wrapper for Inventory Service
│   ├── common/
│   │   ├── enums/                # OperationStatus, OperationType
│   │   ├── guards/
│   │   └── filters/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── app.module.ts
│   └── main.ts
├── test/
├── Dockerfile
├── docker-compose.yml
└── .env
```

---

## 10. Deployment

- **Dockerfile:** multi-stage build (build stage compiles TS → JS; runtime stage runs `node dist/main.js` on a slim base image).
- **docker-compose.yml:** services for `operations-service`, `postgres`, and (optionally, for local dev) a stub/mock `inventory-service`.
- Environment variables: `DATABASE_URL`, `JWT_SECRET`, `INVENTORY_SERVICE_URL`, `PORT`.
- Swagger UI exposed at `/api/docs` in non-production environments.

---

## 11. Reference Material

- Original problem statement: StockSense IMS (frontend/product scope) — Products, Receipts, Deliveries, Transfers, Adjustments, Dashboard.
- Mockup: [Excalidraw wireframe](https://link.excalidraw.com/l/65VNwvy7c4X/3ENvQFu9o8R)

---

*This spec is scoped strictly to the Operations Management Service. Any request to read/write Product, Warehouse, Location, or Stock data directly should be treated as out of scope and routed through the Inventory Service's API instead.*
