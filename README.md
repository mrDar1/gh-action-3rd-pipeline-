# Order Processing Service

REST API for managing orders, built with **Express + TypeScript**. Orders are kept
in memory (state resets on restart).

## Stack
 somthing 
- Node.js >= 18, TypeScript 5
- Express 4
- Jest + ts-jest + supertest (unit + API tests)
- ESLint (`@typescript-eslint`)

## Setup

```bash
npm install
npm run dev      # hot-reload dev server (ts-node-dev)
npm run build    # compile to dist/
npm start        # run compiled server
npm run lint     # ESLint
npm run typecheck
npm test         # Jest + coverage
```

Server listens on `http://localhost:3000` (override with `PORT`).

## Domain Rules

- **Pricing discounts:** large order (amount >= 1000) → 10%, premium customer →
  15%, both → 20%.
- **Status transitions:** `pending → approved | rejected`, `approved → shipped`.
  Any other transition is rejected with `409`.

## API

Base path: `/api`

| Method | Path                       | Description                         | Success |
|--------|----------------------------|-------------------------------------|---------|
| GET    | `/health`                  | Liveness probe                      | 200     |
| GET    | `/api/orders`              | List all orders                     | 200     |
| POST   | `/api/orders`              | Create an order                     | 201     |
| GET    | `/api/orders/:id`          | Get one order                       | 200     |
| GET    | `/api/orders/:id/pricing`  | Pricing breakdown                   | 200     |
| PATCH  | `/api/orders/:id/status`   | Change status `{ "status": "..." }` | 200     |
| DELETE | `/api/orders/:id`          | Delete an order                     | 204     |

Errors return `{ "error": "<message>" }` with status `400` / `404` / `409` / `500`.

### Create order body

```json
{
  "id": "ORD-001",
  "customerId": "CUST-1",
  "isPremium": false,
  "items": [
    { "name": "Widget", "price": 50, "quantity": 2 }
  ]
}
```

### Example

```bash
curl -X POST http://localhost:3000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"id":"ORD-1","customerId":"C-1","items":[{"name":"Widget","price":50,"quantity":2}]}'

curl -X PATCH http://localhost:3000/api/orders/ORD-1/status \
  -H 'Content-Type: application/json' -d '{"status":"approved"}'
```

## Project Layout

Layered architecture (domain → repository → service → API):

```
src/
  domain/                    business rules, framework-agnostic
    types.ts                 domain types + AppError
    pricing.ts               discount / final price logic
    validator.ts             order field validation
    order.ts                 createOrder / status transitions
    index.ts                 barrel export
  repositories/
    orderRepository.ts       IOrderRepository + in-memory impl
  services/
    orderService.ts          use cases (DI on repository)
  api/
    routes/orderRoutes.ts    Express router
    middleware/errorHandler.ts  404 + central error handler
  config/
    env.ts                   environment config
  app.ts                     app factory (wires layers)
  server.ts                  entrypoint
tests/                       unit + API tests (Jest)
```
# gh-action-3rd-pipeline-
