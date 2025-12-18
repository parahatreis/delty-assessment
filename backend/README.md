# Backend API

Minimal TypeScript, Fastify, and Drizzle ORM setup.

## Structure

```
src/
├── config/        # Environment and app configuration
├── db/            # Database schema and connection
├── routes/        # API route handlers
├── types/         # TypeScript type definitions
└── index.ts       # Application entry point
```

## Setup

1. Create `.env` file:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PORT=3001
```

2. Generate and run migrations:
```bash
yarn db:generate
yarn db:migrate
```

3. Start dev server:
```bash
yarn dev
```

## Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn db:generate` - Generate migrations from schema
- `yarn db:migrate` - Run migrations
- `yarn db:studio` - Open Drizzle Studio

## Endpoints

- `GET /api/health` - Health check
- `GET /api/users` - Get all users
