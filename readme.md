# Fastify TypeScript Starter

A sightly opinonated Fastify REST API starter with TypeScript, SQLite, and Kysely ORM.

## Features

- Fastify web framework
- SQLite database with Kysely ORM
- TypeScript support
- Testing with Node.js test runner
- Database migrations
- Hot reloading in development
- Prettier for code formatting

## Getting Started

### Prerequisites

- Node.js 20.10+
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fastify-starter

# Install dependencies
npm install

# create a .env file (see below)
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app.ts              # Application entry point
├── plugins/            # Fastify plugins
│   ├── db.plugin.ts    # Database plugin
│   ├── env.plugin.ts   # Environment configuration
│   └── user.plugin.ts  # User service plugin
├── routes/             # API routes
│   ├── index.ts        # Root routes
│   └── userRoutes.ts   # User-related routes
├── services/           # Business logic
│   └── user.service.ts # User service
├── schemas/            # Schemas for request response
│   └── user.schema.ts  # TypeBox schemas to validate user.service req/res params
└── types/              # TypeScript type definitions
```

## NPM Packages

### Dependencies

| Package                         | Version  | Description                                  |
| ------------------------------- | -------- | -------------------------------------------- |
| `argon2`                        | ^0.43.0  | Password hashing library                     |
| `better-sqlite3`                | ^12.1.1  | SQLite3 database driver                      |
| `dotenv`                        | ^16.5.0  | Loads environment variables from .env file   |
| `fastify`                       | ^5.4.0   | Fast and low overhead web framework          |
| `fastify-plugin`                | ^5.0.1   | Plugin helper for Fastify                    |
| `@sinclair/typebox`             | ^0.34.38 | TypeBox schema validator                     |
| `fastify/type-provider-typebox` | ^5.2.0   | Integrates TypeBox as a Fastify TypeProvider |
| `kysely`                        | ^0.28.2  | TypeScript SQL query builder                 |

### Dev Dependencies

| Package                 | Version | Description                                             |
| ----------------------- | ------- | ------------------------------------------------------- |
| `@types/argon2`         | ^0.15.4 | TypeScript definitions for argon2                       |
| `@types/better-sqlite3` | ^7.6.13 | TypeScript definitions for better-sqlite3               |
| `@types/dotenv`         | ^8.2.3  | TypeScript definitions for dotenv                       |
| `@types/node`           | ^24.0.4 | TypeScript definitions for Node.js                      |
| `concurrently`          | ^9.2.0  | Run multiple commands concurrently                      |
| `fastify-tsconfig`      | ^3.0.0  | Shared TypeScript config for Fastify                    |
| `nodemon`               | ^3.1.10 | Automatically restart Node.js application               |
| `prettier`              | ^3.6.1  | Code formatter                                          |
| `tsx`                   | ^4.20.3 | TypeScript Execute (tsx): Node.js enhanced with esbuild |
| `typescript`            | ^5.8.3  | TypeScript compiler                                     |

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=development
PORT=3000
SQLITE_PATH=./db.sqlite
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change_this_password
```

Example `.env.test`

```env
NODE_ENV=test
SQLITE_PATH=:memory:  # Use in-memory database for tests
```

## API Documentation

### Users

- `GET /api/user/:name` - Get user by username

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Fastify Type Provider with TypeBox

https://fastify.dev/docs/latest/Reference/Type-Providers/

See here specifically, for extending the fastify app type,
https://fastify.dev/docs/latest/Reference/Type-Providers/#type-definition-of-fastifyinstance--typeprovider

https://github.com/fastify/fastify-type-provider-typebox

When using the @fastify/type-provider-typebox plugin, schemas become the source of truth for both runtime validation and TypeScript type inference.

Manually defining route generics like this is not required:

```ts
fastify.get<{
  Params: { name: string };
}>('/user/:name', { schema }, handler);
```

Instead, by defining your params, query, body, and response schemas with TypeBox, Fastify can automatically infer types for request.params, request.query, request.body, and reply.send().
