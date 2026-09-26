# StockSense — Frontend Integration Guide

This document explains how to connect the Next.js frontend to the StockSense Inventory Service.

## 1. Configuration

### Frontend .env
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Production
```env
NEXT_PUBLIC_API_URL=https://api.stocksense.com/api/v1
```

---

## 2. API Client Setup

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('accessToken');

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle token expiry
    if (response.status === 401 && token) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return apiRequest(endpoint, options); // Retry
      }
      // Redirect to login
      window.location.href = '/login';
    }
    throw new ApiError(data.error?.code, data.error?.message, response.status);
  }

  return data;
}

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
```

---

## 3. Authentication Flow

### Login
```typescript
async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data.user;
  }

  throw new Error(data.error?.message || 'Login failed');
}
```

### Token Refresh
```typescript
async function refreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return true;
    }
  } catch {
    // Token refresh failed
  }

  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  return false;
}
```

### Logout
```typescript
async function logout() {
  await apiRequest('/auth/logout', { method: 'POST' });
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}
```

### Get Current User
```typescript
const user = await apiRequest<User>('/auth/me');
```

---

## 4. Products

### List Products
```typescript
const products = await apiRequest<Product[]>(
  '/products?page=1&limit=20&search=wireless&category=Electronics&sortBy=name&sortOrder=asc'
);
// products.data = Product[]
// products.meta = { page, limit, total, totalPages }
```

### Get Product
```typescript
const product = await apiRequest<ProductWithStock>(`/products/${id}`);
// product.data.stock = { onHand, reserved, available }
```

### Create Product
```typescript
const product = await apiRequest<Product>('/products', {
  method: 'POST',
  body: JSON.stringify({
    sku: 'ELEC-WB-001',
    name: 'Wireless Buds',
    category: 'Electronics',
    unit: 'PCS',
    price: 2500,
    cost: 1800,
    reorderLevel: 100,
    reorderQuantity: 500,
  }),
});
```

### Update Product
```typescript
const updated = await apiRequest<Product>(`/products/${id}`, {
  method: 'PATCH',
  body: JSON.stringify({ name: 'Updated Name', price: 2800 }),
});
```

### Delete Product
```typescript
await apiRequest(`/products/${id}`, { method: 'DELETE' });
```

---

## 5. Stock

### List Stock
```typescript
const stock = await apiRequest<Stock[]>(
  '/stock?warehouseId=uuid&status=low&page=1&limit=20'
);
```

### Low Stock Alert
```typescript
const lowStock = await apiRequest<Stock[]>('/stock/low');
```

### Out of Stock
```typescript
const outOfStock = await apiRequest<Stock[]>('/stock/out-of-stock');
```

### Product Stock
```typescript
const productStock = await apiRequest<Stock[]>(`/products/${id}/stock`);
```

---

## 6. Warehouses

```typescript
// List
const warehouses = await apiRequest<Warehouse[]>('/warehouses?search=main');

// Get with capacity info
const warehouse = await apiRequest<WarehouseDetail>(`/warehouses/${id}`);
// warehouse.data.utilization, warehouse.data.occupied, warehouse.data.available

// Create
await apiRequest('/warehouses', {
  method: 'POST',
  body: JSON.stringify({ code: 'WH-NEW', name: 'New Warehouse', capacity: 10000 }),
});
```

---

## 7. Locations

```typescript
// List (filter by warehouse)
const locations = await apiRequest<Location[]>(`/locations?warehouseId=${warehouseId}`);

// Create
await apiRequest('/locations', {
  method: 'POST',
  body: JSON.stringify({ warehouseId, code: 'A-01', name: 'Zone A', capacity: 5000 }),
});
```

---

## 8. Reorder Rules

```typescript
// List
const rules = await apiRequest<ReorderRule[]>('/reorder-rules?productId=uuid');

// Create
await apiRequest('/reorder-rules', {
  method: 'POST',
  body: JSON.stringify({
    productId: 'uuid',
    warehouseId: 'uuid',
    minimumStock: 100,
    maximumStock: 1000,
    reorderQuantity: 500,
  }),
});
```

---

## 9. Dashboard

```typescript
// Summary card data
const summary = await apiRequest<InventorySummary>('/dashboard/inventory-summary');
// summary.data.totalInventoryValue
// summary.data.inventoryVolume
// summary.data.activeSkus
// summary.data.warehouseCapacity.percentage

// Donut chart data
const status = await apiRequest<StockStatus>('/dashboard/stock-status');
// status.data.normal, status.data.warning, status.data.critical

// Top items table
const topItems = await apiRequest<TopItem[]>('/dashboard/top-inventory-items?limit=5');

// Warehouse capacity bars
const capacity = await apiRequest<WarehouseCapacity>('/dashboard/warehouse-capacity');
// capacity.data.warehouses[].utilization
```

---

## 10. Pagination Pattern

All list endpoints support:
```
?page=1&limit=20
```

Response always includes:
```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 11. Error Handling

```typescript
try {
  await apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify({ sku: 'EXISTING-SKU', ... }),
  });
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'DUPLICATE_SKU':
        showToast('This SKU already exists');
        break;
      case 'VALIDATION_ERROR':
        showToast(error.message);
        break;
      default:
        showToast('An error occurred');
    }
  }
}
```

---

## 12. CORS

The backend allows requests from the URL specified in `FRONTEND_URL` env var (default: `http://localhost:3000`).

Ensure your frontend runs on the allowed origin. Credentials (Authorization header) are supported.

---

## 13. Frontend Route ↔ API Mapping

| Frontend Route | API Call |
|---------------|----------|
| `/` (Dashboard) | GET `/dashboard/inventory-summary`, `/dashboard/stock-status`, `/dashboard/warehouse-capacity`, `/dashboard/top-inventory-items` |
| `/products` | GET `/products` |
| `/products/new` | POST `/products` |
| `/products/:id` | GET `/products/:id` |
| `/products/:id/edit` | PATCH `/products/:id` |
| `/stock` | GET `/stock` |
| `/warehouses` | GET `/warehouses` |
| `/warehouses/new` | POST `/warehouses` |
| `/warehouses/:id` | GET `/warehouses/:id` |
| `/locations` | GET `/locations` |
| `/locations/new` | POST `/locations` |
| `/locations/:id` | GET `/locations/:id` |
| `/settings/reorder-rules` | GET/POST/PATCH/DELETE `/reorder-rules` |
