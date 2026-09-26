# StockSense Operations Test Matrix

This matrix is aligned to `StockSense-Operations-Service-Spec.md` and is intentionally limited to the Operations Management Service.

| ID | Area | Test | Expected result |
|---|---|---|---|
| T01 | Build | Compile all `src/**/*.ts` with strict TypeScript settings after dependencies are installed | 0 TypeScript errors |
| T02 | Boundary | Prisma schema contains operations models only | No Product, Warehouse, Location, or Stock model |
| T03 | Routing | All required REST routes are present | Static route contract passes; no duplicate method/path pair |
| T04 | Routing | Move History has no mutation endpoint | No POST/PATCH/DELETE controller route |
| T05 | Auth | Protected endpoint without JWT in production mode | 401 |
| T06 | Auth | Manager-only action with WarehouseStaff role | 403 |
| T07 | Receipt | Create receipt | DRAFT + lines persisted |
| T08 | Receipt | Submit complete receipt | DRAFT -> WAITING -> READY |
| T09 | Receipt | Submit incomplete receipt | DRAFT -> WAITING, not READY |
| T10 | Receipt | Validate READY receipt | Inventory increment happens before DONE; Move History written |
| T11 | Receipt | Validate twice | Second validation rejected with 409; no duplicate ledger row |
| T12 | Receipt | Inventory increment failure | Operation is not marked DONE; downstream error is surfaced |
| T13 | Delivery | Pick | DRAFT -> WAITING and line/document pick timestamp recorded |
| T14 | Delivery | Pack | WAITING -> READY and line/document pack timestamp recorded |
| T15 | Delivery | Validate | Inventory decrement happens before DONE; Move History written |
| T16 | Transfer | Validate transfer | Exactly one atomic Inventory `POST /stock/move`; DONE only after success |
| T17 | Adjustment | Create adjustment | Live `recordedQty` fetched from Inventory Service; delta computed |
| T18 | Adjustment | Apply adjustment | Inventory adjustment happens before DONE; Move History written for non-zero delta |
| T19 | Move History | Attempt UPDATE/DELETE directly in PostgreSQL | Trigger rejects mutation |
| T20 | References | Concurrent reference generation | Database-backed counter prevents duplicate reference numbers |
| T21 | Pagination | List with page/limit | `{ data, meta: { page, limit, total } }`, max 100 rows |
| T22 | Validation | Unknown DTO field | 400 due to `forbidNonWhitelisted` |
| T23 | Validation | Negative quantity | 400 |
| T24 | Observability | Request correlation ID | Response contains correlation ID; Inventory calls propagate it |
| T25 | Health | GET `/health` | Public database-backed `status: ok` response |
