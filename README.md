# Delty Assessment

Full-stack application with React, Fastify, and PostgreSQL deployed on AWS.

## Live URLs

- **Frontend**: https://master.d3sjur73hlhrtl.amplifyapp.com/
- **Backend API**: https://42m5xx7z9g.us-east-1.awsapprunner.com/api

## Tech Stack

**Frontend**: React, Vite, TailwindCSS 4, Radix UI, Zustand, React Query  
**Backend**: Fastify, Node.js, PostgreSQL, Drizzle ORM  
**Infrastructure**: AWS CDK, App Runner, Amplify, RDS, VPC, ECR  
**CI/CD**: GitHub Actions

## Prerequisites

- Node.js 20+
- Yarn 3.6.4+
- Docker
- AWS CLI + CDK CLI

## Quick Start

```bash
# Install dependencies
yarn install

# Setup environment
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start local PostgreSQL
docker run -d -e POSTGRES_DB=delty_assessment -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:16

# Run migrations
cd backend && yarn db:migrate

# Start dev servers (from root)
yarn dev
```

- Backend: http://localhost:8080
- Frontend: http://localhost:5173

## Scripts

```bash
yarn dev              # Start both frontend and backend
yarn dev:backend      # Backend only
yarn dev:frontend     # Frontend only
yarn build            # Build all workspaces
yarn db:migrate       # Run database migrations
yarn docker:backend   # Build backend Docker image
```

## Environment Variables

**Backend** (`backend/.env`):
```env
PORT=8080
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NODE_ENV=development
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

## License

ISC
