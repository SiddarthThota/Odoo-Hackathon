# StockSense Inventory Service — API Contract

All endpoints use the base path: `/api/v1`

## Authentication

All protected endpoints require the header:
```
Authorization: Bearer <accessToken>
```

---

## Response Format

### Success (Single Resource)
```json
{
  "success": true,
  "data": { ... }
}
```

### Success (List)
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

---

## AUTH

### POST /api/v1/auth/register

**Auth**: None

**Request**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "StrongP@ss123",
  "role": "STAFF"
}
```

**Response** `201`:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "STAFF",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

**Errors**:
- `409` EMAIL_ALREADY_EXISTS

---

### POST /api/v1/auth/login

**Auth**: None

**Request**:
```json
{
  "email": "admin@stocksense.com",
  "password": "Admin@123"
}
```

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "Rajesh",
      "lastName": "Kumar",
      "email": "admin@stocksense.com",
      "role": "ADMIN",
      "isActive": true
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

**Errors**:
- `401` INVALID_CREDENTIALS
- `401` ACCOUNT_DISABLED

---

### POST /api/v1/auth/refresh

**Auth**: None

**Request**:
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```

**Response** `200`: Same as login response.

**Errors**:
- `401` INVALID_REFRESH_TOKEN

---

### POST /api/v1/auth/logout

**Auth**: Bearer JWT

**Response** `200`:
```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

---

### GET /api/v1/auth/me

**Auth**: Bearer JWT

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Rajesh",
    "lastName": "Kumar",
    "email": "admin@stocksense.com",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## PRODUCTS

### POST /api/v1/products

**Auth**: Bearer JWT  
**Roles**: ADMIN, MANAGER

**Request**:
```json
{
  "sku": "ELEC-WB-001",
  "name": "Wireless Buds",
  "description": "Premium wireless earbuds",
  "category": "Electronics",
  "unit": "PCS",
  "price": 2500,
  "cost": 1800,
  "barcode": "8901234567001",
  "supplier": "Sony",
  "brand": "Sony",
  "reorderLevel": 100,
  "reorderQuantity": 500
}
```

**Response** `201`:
```json
{
  "success": true,
  "data": { "id": "uuid", "sku": "ELEC-WB-001", ... }
}
```

**Errors**:
- `409` DUPLICATE_SKU

---

### GET /api/v1/products

**Auth**: Bearer JWT

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| search | string | — | Search name, SKU, category |
| category | string | — | Filter by category |
| status | string | — | `active` or `inactive` |
| sortBy | string | createdAt | Sort field |
| sortOrder | string | desc | `asc` or `desc` |

**Response** `200`:
```json
{
  "success": true,
  "data": [ ... ],
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

---

### GET /api/v1/products/:id

**Auth**: Bearer JWT

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "sku": "ELEC-WB-001",
    "name": "Wireless Buds",
    "category": "Electronics",
    "stock": {
      "onHand": 1240,
      "reserved": 60,
      "available": 1180
    },
    ...
  }
}
```

---

### PATCH /api/v1/products/:id

**Auth**: Bearer JWT  
**Roles**: ADMIN, MANAGER

All fields optional. SKU changes are validated for uniqueness.

---

### DELETE /api/v1/products/:id

**Auth**: Bearer JWT  
**Roles**: ADMIN

Soft-deletes (deactivates) if stock exists. Hard-deletes if no stock.

---

## WAREHOUSES

### POST /api/v1/warehouses
### GET /api/v1/warehouses
### GET /api/v1/warehouses/:id
### PATCH /api/v1/warehouses/:id
### DELETE /api/v1/warehouses/:id

Similar CRUD pattern. See Swagger for full details.

GET /:id response includes `occupied`, `available`, `utilization`, `locationCount`.

---

## LOCATIONS

### POST /api/v1/locations
### GET /api/v1/locations
### GET /api/v1/locations/:id
### PATCH /api/v1/locations/:id
### DELETE /api/v1/locations/:id

Supports `warehouseId` filter. Location code is unique per warehouse.

---

## STOCK

### GET /api/v1/stock

**Query Parameters**: productId, warehouseId, locationId, category, status, search, page, limit, sortBy, sortOrder

### GET /api/v1/stock/low
### GET /api/v1/stock/out-of-stock
### GET /api/v1/stock/:id
### GET /api/v1/products/:id/stock
### GET /api/v1/warehouses/:id/stock
### GET /api/v1/locations/:id/stock

---

## INTERNAL STOCK OPERATIONS

### POST /api/v1/internal/stock/increase

```json
{
  "productId": "uuid",
  "warehouseId": "uuid",
  "locationId": "uuid",
  "quantity": 100
}
```

### POST /api/v1/internal/stock/decrease

Same body. Returns `409 INSUFFICIENT_STOCK` if not enough available.

### POST /api/v1/internal/stock/reserve
### POST /api/v1/internal/stock/release

Same body format.

### POST /api/v1/internal/stock/transfer

```json
{
  "productId": "uuid",
  "sourceWarehouseId": "uuid",
  "sourceLocationId": "uuid",
  "destinationWarehouseId": "uuid",
  "destinationLocationId": "uuid",
  "quantity": 50
}
```

---

## REORDER RULES

### POST /api/v1/reorder-rules
### GET /api/v1/reorder-rules
### GET /api/v1/reorder-rules/:id
### PATCH /api/v1/reorder-rules/:id
### DELETE /api/v1/reorder-rules/:id

---

## DASHBOARD

### GET /api/v1/dashboard/inventory-summary

```json
{
  "success": true,
  "data": {
    "totalInventoryValue": 18500000,
    "inventoryVolume": 12869,
    "activeSkus": 4128,
    "warehouseCapacity": {
      "occupied": 14500,
      "total": 20500,
      "percentage": 70.73
    }
  }
}
```

### GET /api/v1/dashboard/stock-status

```json
{
  "success": true,
  "data": {
    "totalSkus": 4128,
    "normal": 3120,
    "warning": 780,
    "critical": 228
  }
}
```

### GET /api/v1/dashboard/top-inventory-items?limit=5

### GET /api/v1/dashboard/warehouse-capacity

---

## ERROR CODES

| Code | HTTP | Description |
|------|------|-------------|
| INVALID_CREDENTIALS | 401 | Wrong email/password |
| UNAUTHORIZED | 401 | Missing/invalid token |
| FORBIDDEN | 403 | Insufficient role |
| PRODUCT_NOT_FOUND | 404 | Product ID invalid |
| WAREHOUSE_NOT_FOUND | 404 | Warehouse ID invalid |
| LOCATION_NOT_FOUND | 404 | Location ID invalid |
| STOCK_NOT_FOUND | 404 | Stock record not found |
| DUPLICATE_SKU | 409 | SKU already exists |
| DUPLICATE_WAREHOUSE_CODE | 409 | Warehouse code exists |
| DUPLICATE_LOCATION_CODE | 409 | Location code exists in warehouse |
| INSUFFICIENT_STOCK | 409 | Not enough available stock |
| CAPACITY_TOO_LOW | 400 | Capacity below occupancy |
| LOCATION_WAREHOUSE_MISMATCH | 400 | Location not in warehouse |
| VALIDATION_ERROR | 422 | Request body validation failed |
