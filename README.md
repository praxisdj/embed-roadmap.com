# Embedded Roadmap

A simple roadmap management platform with embeddable Kanban boards. Create and manage feature roadmaps with drag-and-drop functionality, customizable styling, and seamless embedding capabilities.

## ✨ Features

- **Kanban Board Interface**: Drag-and-drop feature management with status tracking
- **Embeddable Roadmaps**: Customizable embed widgets for external websites
- **Real-time Collaboration**: Multi-user access with role-based permissions
- **Custom Styling**: Full control over embed appearance and branding
- **Feature Management**: Create, edit, delete, and vote on features
- **Status Tracking**: Backlog, Next Up, In Progress, and Done statuses

## 🛠 Tech Stack

- **Frontend**: Next.js + TypeScript
- **Styling**: Tailwind CSS, Radix UI, Shadcn/ui
- **Backend**: Bun + Next.js + Prisma ORM + TypeScript
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Testing**: Bun Test
- **Queue**: BullMQ with Redis

## 🏗 Architecture Patterns

### Service Layer Pattern

The application follows a clean service layer architecture where business logic is separated from API routes:

```typescript
// Services handle business logic
export class RoadmapService {
  async createRoadmap(
    userId: string,
    data: CreateRoadmapSchema,
  ): Promise<Roadmap>;
  async findRoadmaps(
    userId: string,
    filters?: Prisma.RoadmapWhereInput,
  ): Promise<Roadmap[]>;
  async updateRoadmap(
    userId: string,
    id: string,
    data: UpdateRoadmapSchema,
  ): Promise<Roadmap>;
}
```

**Benefits**:

- Centralized business logic
- Easy testing and mocking
- Reusable across different API endpoints
- Clear separation of concerns

### API Handler Pattern

All API routes use a consistent error handling wrapper:

```typescript
export function apiHandler(handler: Handler) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error, request);
    }
  };
}
```

**Benefits**:

- Consistent error handling across all endpoints
- Automatic logging and monitoring
- Centralized error response formatting

### Custom Error Classes

The application uses a structured error handling system:

```typescript
export class AppError extends Error {
  statusCode: number;
  isCriticalError: boolean;
  meta?: unknown;
}
```

**Benefits**:

- Type-safe error handling
- Consistent error responses
- Detailed error metadata for debugging

### Type-Safe Validation

All data validation uses Zod schemas with TypeScript integration:

```typescript
export const CreateRoadmapSchema = z.object({
  name: z.string().min(1).max(100),
  isPublic: z.boolean(),
  users: z.array(z.string()).min(1),
});
```

**Benefits**:

- Runtime type safety
- Automatic TypeScript types
- Consistent validation across frontend and backend

## 🧪 Testing Standards

### Test Structure

Tests follow a consistent pattern with proper setup and teardown:

```typescript
describe("API Endpoint", () => {
  beforeEach(async () => {
    await clearDatabase();
    mock.restore();
  });

  test("should handle success case", async () => {
    // Arrange
    const testData = createTestData();

    // Act
    const response = await makeRequest(testData);

    // Assert
    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(expectedData);
  });
});
```

### Database Testing

- Each test runs with a clean database state
- Tests use utility functions for data creation
- Proper cleanup between test runs

### Mocking Strategy

- External services are mocked at the module level
- Authentication is mocked for API tests
- Database operations use real database with cleanup

## 🚀 Getting Started

### Prerequisites

- Bun
- Docker and Docker Compose

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd embedded-roadmap
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.test .env
   # Edit .env with your configuration
   ```

4. **Start services**

   ```bash
   bun run services:up
   ```

5. **Run database migrations**

   ```bash
   bun run prisma:migrate:dev
   ```

6. **Start development server**
   ```bash
   bun run dev
   ```

### Running Tests

```bash
# Run all tests
bun run test

# Run specific test file
bun test tests/api/roadmap/get.test.ts --bail
```

## 📁 Project Structure

```
src/
├── app/                   # Next.js app router
│   ├── api/               # API routes
│   ├── roadmap/           # Roadmap pages
│   └── globals.css
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   └── RoadmapEmbed.tsx   # Embed component
├── lib/                   # Utilities and configuration
│   └── utils/             # Helper functions
├── services/              # Business logic layer
│   ├── roadmap.service.ts
│   ├── user.service.ts
│   └── feature.service.ts
└── types/                # TypeScript type definitions
    ├── roadmap.type.ts
    ├── user.type.ts
    └── feature.type.ts
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the coding standards**:
   - Use TypeScript for all new code
   - Follow the service layer pattern
   - Write tests for new functionality
   - Use the established error handling patterns
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For questions, bug reports, or feature requests, please open an issue on GitHub.
