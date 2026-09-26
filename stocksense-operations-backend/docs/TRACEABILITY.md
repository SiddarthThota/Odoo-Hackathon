# StockSense Operations Traceability

This implementation was checked against `StockSense-Operations-Service-Spec.md` supplied with the project.

| Spec area | Implementation |
|---|---|
| Service boundary | Operations persists only operations, references, metadata and Move History. No Product/Warehouse/Location/Stock models. |
| Stack | NestJS, TypeScript, PostgreSQL, Prisma, JWT, class-validator, REST, Swagger, Docker. |
| Lifecycle | DRAFT -> WAITING -> READY -> DONE, with CANCELED from pre-terminal states. |
| Receipts | List/detail/create/update/submit/validate/cancel/delete routes. |
| Deliveries | List/detail/create/update/pick/pack/validate/cancel routes. |
| Transfers | List/detail/create/validate/cancel routes. Uses one Inventory Service move call. |
| Adjustments | List/detail/create/apply. `recordedQty` is fetched from Inventory Service. |
| Move History | Read-only public API; no mutation endpoints; PostgreSQL trigger blocks UPDATE/DELETE. |
| Statistics | Summary, status grouping and recent activity. |
| Pagination | List routes expose page/limit and return `{ data, meta }`. |
| Validation | Global `ValidationPipe` with whitelist + forbidNonWhitelisted. DTO constraints reject negative/invalid values. |
| Error semantics | 400/401/403/404/409/502 handling is standardized. |
| Security | Global JWT guard, manager-only validate/cancel/apply, development bypass rejected in production. |
| Observability | Correlation ID response/request header and health endpoint. |
| Inventory integration | HTTP client for increment/decrement/move/adjust and quantity lookup; mock adapter exists only for local development/tests. |

## Explicit integration assumptions

The Operations specification names the Inventory Service mutation endpoints but does not specify every request body or the exact quantity-read endpoint. This implementation therefore uses:

- `POST /stock/increment`
- `POST /stock/decrement`
- `POST /stock/move`
- `POST /stock/adjust`
- `GET /stock/quantity?productId=...&locationId=...`

These request shapes are isolated inside `src/inventory-client/http-inventory.client.ts`, so they can be changed without modifying operation modules.

The receipt workflow has no separate public `WAITING -> READY` endpoint in the supplied API surface. `POST /receipts/:id/submit` therefore atomically records `WAITING` and immediately advances to `READY` when the documented readiness condition is already satisfied; otherwise it remains `WAITING`.

The transfer and adjustment API surfaces provide only validate/apply actions, so those operations can be completed directly from their initial `DRAFT` state after their required checks. This avoids inventing undocumented public endpoints.
