# InventraX - Odoo Hackathon Project

## Overview

InventraX (formerly StockSense) is a comprehensive, full-stack Warehouse & Inventory Management System. The project aims to deliver a robust, scalable, and visually premium dashboard for tracking inventory lifecycle, including receipts, deliveries, transfers, and adjustments.

## Architecture & Current State

From what has been built and configured so far, the project is divided into three distinct architectural pillars:

### 1. Frontend (`stocksense-frontend`)
- **Tech Stack:** Next.js (App Router), React, Tailwind CSS, shadcn/ui, Zustand, Axios.
- **Current State:** The UI is heavily built out. It features a modern, clean dashboard with horizontal top navigation (eschewing sidebars). Pages for `receipts`, `deliveries`, `transfers`, and `adjustments` have been implemented with both List and Kanban views. A sleek authentication page was recently added.
- **Role:** To provide an intuitive, responsive user interface for warehouse operators and managers to visualize and action stock movements.

### 2. Operations Backend (`stocksense-operations-backend`)
- **Tech Stack:** NestJS, TypeScript, Prisma (PostgreSQL).
- **Current State:** A robust set of controllers and services exist for core operational entities (`adjustments`, `deliveries`, `receipts`, `transfers`, `move-history`, `stats`). Prisma is set up for database migrations and schema management.
- **Role:** This is the primary API gateway and business logic layer. It handles the state machines for operations (e.g., Draft -> In Progress -> Done), data validation, user roles/authentication, and database persistence.

### 3. Inventory Service (`inventory-service`)
- **Tech Stack:** Python, FastAPI.
- **Current State:** Currently running via Uvicorn.
- **Role:** Likely serves as a specialized microservice for handling complex inventory calculations, forecasting, or Python-specific integrations (e.g., AI/ML predictive analytics for reorder rules, anomaly detection in stock levels, or specialized algorithms that are better suited for Python than Node.js).

## Our Next Steps & Integration Plan

To bring the entire system to life, our primary goal is **Integration**:
1. **Frontend to Operations Backend:** We need to replace the frontend's mocked data and simulated API calls with actual Axios requests to the NestJS endpoints. We will hook up the newly created login page to the NestJS authentication guard.
2. **Operations Backend to Inventory Service:** Establish internal communication (HTTP or message queue) between the NestJS operations service and the Python FastAPI inventory service so they share state and calculations seamlessly.
3. **Database Seeding & E2E Testing:** Ensure Prisma is seeded with test data and run end-to-end workflows (e.g., receiving stock, moving it, and dispatching it).

---
*Ready to review the provided markdown plan to align our next integration steps!*