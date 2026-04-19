# Jaegar Resto — Production POS System

A full-stack, raw-material–driven Point of Sale system built with Next.js, NestJS, MongoDB, RTK Query, and Material UI.

## Architecture

```
pos-frontend/   → Next.js 15 (App Router) + MUI v9 + RTK Query
pos-backend/    → NestJS + Mongoose + MongoDB
```

## Quick Start

### 1. Configure MongoDB

Edit `pos-backend/.env` and set your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/pos_db?retryWrites=true&w=majority
PORT=3001
```

For local development, use:
```env
MONGODB_URI=mongodb://localhost:27017/pos_db
```

### 2. Start the Backend

```bash
cd pos-backend
npm run start:dev
```

Backend runs at: http://localhost:3001/api

### 3. Seed Test Data (first time only)

```bash
cd pos-backend
npm run seed
```

This creates 14 raw materials, 6 products with recipes, and 15 historical orders.

### 4. Start the Frontend

```bash
cd pos-frontend
npm run dev
```

Frontend runs at: http://localhost:3000

---

## Features

### Raw Materials Management
- CRUD for raw materials (name, unit: g/ml/pcs, stock, min alert)
- Low stock alerts when stock ≤ minStockAlert
- Accessible at `/inventory`

### Product Recipe System
- Products defined with multi-ingredient recipes
- Each recipe item: rawMaterialId + quantityRequired
- Manage at `/settings` → Products Management

### Stock Calculation (Server-Side)
- `GET /api/products/availability` computes `availableQty` per product
- Formula: `min(floor(materialStock / recipeQty))` across all ingredients
- Never stored — always calculated fresh from raw material stock

### POS Flow
- `/` — Product grid with live availability, category filter, search
- Cart with qty controls, per-item notes, order type selection
- `/checkout` — Payment method, customer info, order type, table number
- On confirm: backend verifies stock → deducts atomically → saves order

### Stock Integrity
- MongoDB transactions wrap stock deduction (atomic read-then-write)
- Pre-sale stock verification rejects orders with insufficient materials
- Frontend disables add-to-cart when `qty >= availableQty`

### Dashboard
- Real MongoDB aggregation: revenue, order counts, most ordered products
- Order type breakdown (Dine In / To Go / Delivery) with PieChart
- Low stock alerts panel
- Recent orders table with status management

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/raw-materials | List all raw materials |
| POST | /api/raw-materials | Create raw material |
| PATCH | /api/raw-materials/:id | Update raw material |
| DELETE | /api/raw-materials/:id | Delete raw material |
| GET | /api/raw-materials/low-stock | Materials below min alert |
| GET | /api/products | List all products |
| GET | /api/products/availability | Products with computed availableQty |
| POST | /api/products | Create product with recipe |
| PATCH | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| GET | /api/orders | List all orders |
| POST | /api/orders | Create order (deducts stock) |
| PATCH | /api/orders/:id/status | Update order status |
| GET | /api/dashboard/summary | Full dashboard aggregation |

---

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, MUI v9, RTK Query, Redux Toolkit
- **Backend**: NestJS 11, Mongoose, class-validator, MongoDB transactions
- **Database**: MongoDB (Atlas or local)
