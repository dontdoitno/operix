# Operix — Procurement Management Platform (MVP)

Operix is a lightweight procurement SaaS MVP that connects **Employees**, **Managers**, and **Suppliers** in one transparent workflow.

The product solves a common pain point: procurement spread across email, spreadsheets, and chats. Operix brings the process into one system with explicit statuses, ownership, and role-based actions.

---

## 1) What the project does

Operix covers a full procurement cycle:

1. Employee creates a purchase request
2. Manager reviews and approves/rejects request
3. Manager creates a purchase order for a supplier
4. Supplier processes and updates order status
5. Employee confirms receipt

This flow gives visibility to all actors and creates an auditable process without enterprise complexity.

---

## 2) Roles and permissions

### Employee
Can:
- create purchase requests
- view own requests and statuses
- view own orders
- confirm receipt for delivered orders

Cannot:
- approve/reject requests
- create orders
- manage suppliers

### Manager
Can:
- view all pending requests
- approve/reject requests
- create purchase orders
- view managed orders
- manage supplier interactions

### Supplier
Can:
- view assigned orders
- update assigned order statuses through valid transitions
- provide supplier and delivery notes

Cannot:
- access internal employee request review flows

---

## 3) Architecture goals (for hackathon judging)

This architecture is intentionally designed as **clear MVP architecture**:

- ✅ Explicit layer boundaries
- ✅ Easy to explain in 2–3 minutes
- ✅ Keeps business rules centralized
- ✅ Supports future scaling without overengineering
- ❌ No unnecessary enterprise patterns

---

## 4) Logical system division

## 4.1 Backend (FastAPI + SQLAlchemy + PostgreSQL)

Backend is split into clear layers:

### A) API Layer (`backend/app/api`)
**Responsibility:** HTTP transport and routing only.

- Defines endpoints and request/response contracts
- Applies auth/role dependencies
- Delegates business logic to services
- Returns schema-based responses

Main routers:
- `api/v1/endpoints/auth.py`
- `api/v1/endpoints/users.py`
- `api/v1/endpoints/procurement.py`

### B) Service Layer (`backend/app/services`)
**Responsibility:** business use-cases and workflow rules.

- Contains procurement lifecycle rules
- Validates role permissions and state transitions
- Coordinates repositories
- Controls transaction boundaries (`commit`, `refresh`)

Main services:
- `AuthService`
- `UserService`
- `ProcurementService`

### C) Repository Layer (`backend/app/repositories`)
**Responsibility:** database access abstraction.

- Encapsulates SQLAlchemy queries
- Provides focused persistence methods per aggregate
- Keeps query logic out of API and services

Main repositories:
- `UserRepository`
- `PurchaseRequestRepository`
- `PurchaseOrderRepository`
- `AuthSessionRepository`

### D) Domain/Data Layer (`backend/app/models`, `backend/app/schemas`)

- **Models:** SQLAlchemy ORM entities + enums
- **Schemas:** Pydantic request/response DTOs
- **Enums:** shared lifecycle and role states

### E) Infrastructure/Core (`backend/app/core`, `backend/app/db`, `migrations`)

- app settings and config
- security utilities (password hashing, token hashing)
- DB session factory
- migration history (Alembic)

---

## 4.2 Frontend (Next.js App Router + TypeScript + Tailwind)

Frontend is divided by feature modules and shared components:

- `app/*` routes: page-level entry points
- `components/*`: reusable UI and domain widgets
- `lib/*`: API client, role helpers, formatting, session storage

This keeps UI scalable while preserving MVP speed.

---

## 5) Request flow (end-to-end)

## 5.1 Example: create purchase request

1. **HTTP**: `POST /api/v1/procurement/requests`
2. **API layer** validates payload and role (employee)
3. **Service layer** checks permission and creates domain object
4. **Repository layer** persists request
5. **DB** stores row with `PENDING` status
6. **API** returns `PurchaseRequestOut`

## 5.2 Example: manager approval

1. `POST /api/v1/procurement/requests/{id}/review`
2. Service checks manager role and request exists
3. Service enforces: only `PENDING` can be reviewed
4. Service sets status to `APPROVED` or `REJECTED`
5. Changes are committed and returned

## 5.3 Example: supplier order status transition

1. `POST /api/v1/procurement/orders/{id}/supplier-status`
2. Service verifies assigned supplier ownership
3. Service enforces strict transition map:
   - `CREATED -> CONFIRMED -> IN_FULFILLMENT -> DELIVERED`
4. Invalid transitions return conflict error

This design makes the business process deterministic and easy to reason about.

---

## 6) Data model (MVP core)

Core entities:
- `User` (with role)
- `PurchaseRequest`
- `PurchaseOrder`
- `AuthSession`

Key relationship chain:

`Employee(User)` → creates → `PurchaseRequest` → approved by `Manager(User)` → converted to `PurchaseOrder` → assigned to `Supplier(User)`

---

## 7) Why this architecture is strong for a hackathon

- **Clear separation of concerns:** each layer has a single purpose
- **Fast delivery:** minimal boilerplate, focused modules
- **Maintainable:** business rules live in one place (services)
- **Testable:** API tests validate role behavior and workflow states
- **Demo-friendly:** easy to explain request lifecycle from endpoint to DB

---

## 8) MVP scaling path (without rewriting everything)

The current architecture can scale incrementally:

### Phase 1 — Current MVP
- Monolithic FastAPI app
- PostgreSQL
- Layered modules and role-based workflow

### Phase 2 — Growth
- Add pagination/filtering for list endpoints
- Add read-optimized query methods in repositories
- Add background tasks for notifications
- Add caching for dashboard aggregates

### Phase 3 — Production hardening
- Add audit log table/events for compliance
- Add observability (structured logs, metrics, tracing)
- Add idempotency for critical write operations
- Add rate limiting and stricter auth/session policies

### Phase 4 — Higher scale
- Split high-traffic domains into separate services if needed (orders/reporting)
- Introduce queue/event bus for async integrations
- Keep existing API contracts where possible

Important: current layer boundaries already reduce coupling, so this scaling path is evolutionary—not a rewrite.

---

## 9) Security baseline in current design

- Passwords are hashed (not stored in plaintext)
- Session tokens are generated securely and stored as hashes
- Role checks are enforced at API dependency + service rule levels
- Business rule violations return controlled app errors

Recommended next security increments:
- token rotation strategy
- session expiration cleanup job
- login rate limiting
- audit trail for privileged actions

---

## 10) Repository structure (high-level)

```text
.
├── backend/
│   ├── app/
│   │   ├── api/            # HTTP endpoints + dependencies
│   │   ├── services/       # Use-cases and business rules
│   │   ├── repositories/   # Persistence access
│   │   ├── models/         # ORM entities and enums
│   │   ├── schemas/        # Pydantic DTOs
│   │   ├── core/           # Config, security, exceptions
│   │   └── db/             # Session/base wiring
│   ├── migrations/         # Alembic migrations
│   └── tests/              # API workflow tests
├── frontend/operix/
│   ├── app/                # Next.js routes
│   ├── components/         # Reusable UI and feature components
│   └── lib/                # Client API, auth/session, role logic
└── docker-compose.yml      # Local PostgreSQL
```

---

## 11) How to explain this architecture to judges in 30 seconds

Operix uses a clean MVP layered architecture: **API -> Services -> Repositories -> Database**.

- API handles transport and auth dependencies
- Services own procurement business rules and role/state logic
- Repositories isolate DB queries
- Models/schemas keep contracts explicit

This gives us clarity today and an easy path to scale tomorrow without overengineering.
