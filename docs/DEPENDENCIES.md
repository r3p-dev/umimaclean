# Approved External Dependencies

This document tracks approved external dependencies in accordance with repository engineering protocols. All dependencies listed below are direct dependencies declared in the project's package.json.

## Core Runtime Dependencies

- @adonisjs/core (^7.5.2): AdonisJS framework core, IoC container, HTTP server, and configuration system.
- @adonisjs/auth (^10.1.0): Authentication framework providing session guard and user providers.
- @adonisjs/lucid (^22.4.2): SQL query builder and Active Record ORM based on Knex.
- @adonisjs/inertia (^5.0.1): Server-side adapter for Inertia.js.
- @adonisjs/session (^8.1.0): Session management for HTTP requests.
- @adonisjs/shield (^9.0.0): Security middleware for CSRF protection, Content Security Policy, and secure HTTP headers.
- @adonisjs/cors (^3.0.0): CORS middleware for handling cross-origin requests.
- @adonisjs/static (^2.0.1): Middleware for serving static assets.
- @adonisjs/vite (^6.0.2): Asset bundling integration for Vite.
- @inertiajs/core (^3.7.1) & @inertiajs/react (^3.7.1): Client-side routing and React integration for Inertia.js.
- @tuyau/core (^1.2.2): Core library for type-safe API integration with Tuyau.
- @vinejs/vine (^4.4.0): Schema-based validation library.
- edge.js (^6.5.1): Server-side template engine.
- pg (^8.23.1): PostgreSQL driver for Node.js.
- luxon (^3.7.2): Date and time handling library used by Lucid models.
- react (^19.3.0) & react-dom (^19.3.0): UI framework and DOM rendering library.
- lucide-react (^1.48.0): Icon library for React.
- sonner (^2.0.8): Toast notification library.
- reflect-metadata (^0.2.2): Metadata reflection API for JavaScript and TypeScript.

## Development Dependencies

- @adonisjs/assembler (^8.5.2): Build tooling and development utilities for AdonisJS.
- @adonisjs/eslint-config (^3.1.0): ESLint configuration for AdonisJS projects.
- @adonisjs/prettier-config (^1.5.0): Prettier configuration for consistent code formatting.
- @adonisjs/tsconfig (^2.0.0): Shared TypeScript configuration for AdonisJS projects.
- @japa/assert (^4.2.0): Assertion library for automated tests.
- @japa/runner (^5.3.0): Test runner for executing automated test suites.
- @japa/plugin-adonisjs (^5.2.0): AdonisJS integration for the Japa testing framework.
- @japa/api-client (^3.2.1): HTTP API client for functional endpoint testing, including session, authentication, and security middleware integrations.
- @japa/browser-client (^2.3.0): Browser-based end-to-end testing using Playwright.
- @poppinss/ts-exec (^1.4.4): TypeScript execution utility.
- @types/luxon (^3.7.5): TypeScript definitions for Luxon.
- @types/node (~26.6.2): TypeScript definitions for Node.js.
- @types/pg (^8.23.1): TypeScript definitions for the PostgreSQL client.
- @types/react (^19.3.0) & @types/react-dom (^19.3.0): TypeScript definitions for React and React DOM.
- @vitejs/plugin-react (^6.1.1): React integration plugin for Vite.
- eslint (^10.11.0): JavaScript and TypeScript linting tool.
- eslint-plugin-react (^7.37.5): ESLint rules for React.
- eslint-plugin-react-hooks (^7.1.1): ESLint rules for React Hooks.
- hot-hook (^1.0.0): Hot module replacement tooling for development.
- pino-pretty (^13.1.3): Pretty-printing utility for Pino logs.
- prettier (^3.9.9): Code formatter.
- typescript (~6.0.3): TypeScript compiler and type-checking tool.
- vite (^8.3.0): Frontend build tool and development server.
- youch (^4.1.1): Error reporting and stack trace formatting utility.

## Runtime Requirements

- Node.js (>=24.0.0): Minimum supported Node.js version.
