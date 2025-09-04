# Euler NextJS Boilerplate

A production-ready Next.js boilerplate with comprehensive developer tooling, testing infrastructure, and third-party integrations.

## Project Structure

### Database & Models

- **Models** should be specified in the `infra/prisma/schema.prisma` file
- Database migrations are stored in `infra/prisma/migrations/`
- The Prisma client is configured in `src/lib/prisma.ts`

### Services

- **Services** should be named as `{object}.service.ts` under the `src/services/` directory
- Example: `user.service.ts` for user-related business logic
- Services contain the core business logic and data access operations

### API Routes

- **API endpoints** follow Next.js App Router conventions in `src/app/api/`
- RESTful structure: `src/app/api/{resource}/route.ts` for collection endpoints
- Individual resource endpoints: `src/app/api/{resource}/[id]/route.ts`
- All API routes use the `apiHandler` wrapper for consistent error handling

### Testing

- **Tests** mirror the source structure under the `tests/` directory
- API tests: `tests/api/{resource}/{method}.test.ts`
- Service tests: `tests/services/{service}.service.test.ts`
- Library tests: `tests/lib/{module}.test.ts`
- Uses Bun's built-in test runner

### Infrastructure

- **Docker services** configured in `infra/dev-compose.yaml`, it includes PostgreSQL and Redis containers for local development
- **Database scripts** in `infra/scripts/` for setup and health checks

### Utilities

- **Shared utilities** in `src/lib/utils/`
- **API handler** wrapper for consistent error handling and logging
- **Logger** configuration with Winston
- **Error classes** for different error types

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Runtime**: Bun
- **Testing**: Bun Test
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Logging**: Winston

## Getting Started

### Prerequisites

- Bun installed
- Docker and Docker Compose
- Environment variables configured (see `.env.example`)

### Installation

1. Install dependencies:

```bash
bun install
```

2. Start services (PostgreSQL & Redis):

```bash
bun run services:up
```

3. Set up the database:

```bash
bunx prisma migrate dev
```

4. Start the development server:

```bash
bun run dev
```

## Development Guidelines

### Adding New Features

1. **Define the model** in `infra/prisma/schema.prisma`
2. **Create types** in `src/types/{feature}.type.ts` with Zod schemas
3. **Implement service** in `src/services/{feature}.service.ts`
4. **Create API routes** in `src/app/api/{feature}/route.ts`
5. **Write tests** in `tests/` following the same structure

### File Naming Conventions

- Services: `{object}.service.ts`
- Types: `{object}.type.ts`
- Tests: `{file-being-tested}.test.ts`
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities: camelCase (e.g., `apiHandler.ts`)
