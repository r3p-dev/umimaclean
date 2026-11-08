# System Architecture: umimaclean

## 1. Architectural Overview

The application follows a layered architecture built with AdonisJS 7 and Inertia.js (React).

```
Client (React / Inertia.js)
          │
          ▼
HTTP Layer (Routes, Middleware, Controllers)
          │
          ▼
Service Layer (Business Logic)
          │
          ▼
Data Layer (Lucid ORM, PostgreSQL)
```

Each layer has a distinct responsibility:

- Client Layer: Handles the user interface and client-side interactions.
- HTTP Layer: Manages routing, middleware, request handling, and responses.
- Service Layer: Contains application business logic and operations.
- Data Layer: Handles database models, queries, and persistence.

## 2. Technology Stack

- Backend: AdonisJS 7
- Frontend: React with Inertia.js
- Language: TypeScript
- Validation: VineJS
- ORM: Lucid
- Database: PostgreSQL
- Testing: Japa and Playwright

## 3. Architectural Principles

- Separation of Concerns: Each layer is responsible for a specific part of the application.
- Business Logic Isolation: Business logic is handled by services rather than controllers.
- Type Safety: TypeScript and VineJS provide type-safe application development.
- Configuration Management: Environment variables and application configurations are validated.
- Testability: The application supports unit, functional, and browser testing.
