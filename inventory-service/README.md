# StockSense Inventory Service

Production-grade REST API backend for inventory management, built with NestJS, TypeScript, Prisma, and PostgreSQL.

## Architecture

```
                    FRONTEND (Next.js)
                       │
                       │ REST / JSON
                       ▼
              ┌─────────────────┐
              │ INVENTORY API   │ ← Port 3001
              │    NestJS       │
              └────────┬────────┘
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
   Products          Stock         Warehouses
       │               │                │
       │               │                ▼
       │               │            Locations
       │               │
       │               ▼
       │          Reorder Rules
       │
       └───────────────┬────────────────┘
                       │
                     Prisma
                       │
                       ▼
                  PostgreSQL
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | NestJS 10 |
| Language | TypeScript 5 |
| Database | PostgreSQL 16 |
| ORM | Prisma 5 |
| Auth | JWT (access + refresh tokens) |
| Validation | class-validator, class-transformer |
| Docs | Swagger / OpenAPI |
| Containerization | Docker + Docker Compose |

## Prerequisites

- Node.js 20+
- npm 9+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)

## Quick Start

### 1. Clone & Setup

```bash
cd inventory-service
cp .env.example .env
```

### 2. Start with Docker (Recommended)

```bash
docker compose up --build
```

This starts both PostgreSQL and the inventory service.

### 3. Run Migrations & Seed

```bash
# If using Docker for DB only:
npm install
npx prisma migrate deploy
npm run prisma:seed

# If running fully in Docker, migrations run automatically on startup
```

### 4. Start Development Server (without Docker)

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run start:dev
```

### 5. Verify

- **Health check**: http://localhost:3001/health
- **API docs (Swagger)**: http://localhost:3001/api/docs
- **API base**: http://localhost:3001/api/v1

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | See .env.example |
| `JWT_ACCESS_SECRET` | JWT access token secret | **Required** |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | **Required** |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |
| `THROTTLE_TTL` | Rate limit window (ms) | `60000` |
| `THROTTLE_LIMIT` | Max requests per window | `100` |

## Seed Data Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@stocksense.com | Admin@123 |
| Manager | manager@stocksense.com | Manager@123 |
| Staff | staff@stocksense.com | Staff@123 |

## API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Logout (requires auth) |
| GET | `/api/v1/auth/me` | Current user (requires auth) |

### Products
| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/v1/products` | ✅ | All |
| POST | `/api/v1/products` | ✅ | Admin, Manager |
| GET | `/api/v1/products/:id` | ✅ | All |
| PATCH | `/api/v1/products/:id` | ✅ | Admin, Manager |
| DELETE | `/api/v1/products/:id` | ✅ | Admin |

### Warehouses
| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/v1/warehouses` | ✅ | All |
| POST | `/api/v1/warehouses` | ✅ | Admin, Manager |
| GET | `/api/v1/warehouses/:id` | ✅ | All |
| PATCH | `/api/v1/warehouses/:id` | ✅ | Admin, Manager |
| DELETE | `/api/v1/warehouses/:id` | ✅ | Admin |

### Locations
| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/v1/locations` | ✅ | All |
| POST | `/api/v1/locations` | ✅ | Admin, Manager |
| GET | `/api/v1/locations/:id` | ✅ | All |
| PATCH | `/api/v1/locations/:id` | ✅ | Admin, Manager |
| DELETE | `/api/v1/locations/:id` | ✅ | Admin |

### Stock
| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/v1/stock` | ✅ | All |
| GET | `/api/v1/stock/low` | ✅ | All |
| GET | `/api/v1/stock/out-of-stock` | ✅ | All |
| GET | `/api/v1/stock/:id` | ✅ | All |
| GET | `/api/v1/products/:id/stock` | ✅ | All |
| GET | `/api/v1/warehouses/:id/stock` | ✅ | All |
| GET | `/api/v1/locations/:id/stock` | ✅ | All |

### Internal Stock Operations (Service-to-Service)
| Method | Path | Auth | Roles |
|--------|------|------|-------|
| POST | `/api/v1/internal/stock/increase` | ✅ | Admin, Manager |
| POST | `/api/v1/internal/stock/decrease` | ✅ | Admin, Manager |
| POST | `/api/v1/internal/stock/reserve` | ✅ | Admin, Manager |
| POST | `/api/v1/internal/stock/release` | ✅ | Admin, Manager |
| POST | `/api/v1/internal/stock/transfer` | ✅ | Admin, Manager |

### Reorder Rules
| Method | Path | Auth | Roles |
|--------|------|------|-------|
| GET | `/api/v1/reorder-rules` | ✅ | All |
| POST | `/api/v1/reorder-rules` | ✅ | Admin, Manager |
| GET | `/api/v1/reorder-rules/:id` | ✅ | All |
| PATCH | `/api/v1/reorder-rules/:id` | ✅ | Admin, Manager |
| DELETE | `/api/v1/reorder-rules/:id` | ✅ | Admin, Manager |

### Dashboard
| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/dashboard/inventory-summary` | ✅ |
| GET | `/api/v1/dashboard/stock-status` | ✅ |
| GET | `/api/v1/dashboard/top-inventory-items` | ✅ |
| GET | `/api/v1/dashboard/warehouse-capacity` | ✅ |

### Health
| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | ❌ |
| GET | `/health/db` | ❌ |

## NPM Scripts

```bash
npm run start:dev        # Development with hot reload
npm run build            # Production build
npm run start:prod       # Start production
npm run test             # Unit tests
npm run test:e2e         # E2E tests
npm run lint             # Lint
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database
npm run prisma:studio    # Open Prisma Studio
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests (requires running database)
npm run test:e2e

# Coverage
npm run test:cov
```

## Docker

```bash
# Build and start all services
docker compose up --build

# Start in background
docker compose up -d

# View logs
docker compose logs -f inventory-service

# Stop (preserves data)
docker compose down

# Stop and remove volumes (deletes data)
docker compose down -v
```

## Frontend Connection

```env
# Frontend .env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

```typescript
// Example frontend fetch
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

## Project Structure

```
inventory-service/
├── src/
│   ├── auth/          # Authentication (JWT, login, register)
│   ├── users/         # User management
│   ├── products/      # Product CRUD
│   ├── stock/         # Stock queries and operations
│   ├── warehouses/    # Warehouse management
│   ├── locations/     # Location management
│   ├── reorder-rules/ # Reorder rule configuration
│   ├── dashboard/     # Dashboard analytics
│   ├── common/        # Decorators, guards, filters, interceptors
│   ├── prisma/        # Prisma service
│   ├── config/        # App configuration
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── seed.ts        # Seed data
├── test/              # E2E tests
├── docs/              # API documentation
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker compose ps

# Reset database
npx prisma migrate reset
```

### Port Conflicts
Change the `PORT` in `.env` and update `docker-compose.yml` port mapping.

### CORS Errors
Ensure `FRONTEND_URL` matches your frontend's origin exactly (including port).

## License

MIT
