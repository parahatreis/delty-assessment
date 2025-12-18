# Delty Assessment

Full-stack application with AWS deployment infrastructure.

## 🎉 Implementation Complete

All features from `app_plan.md` have been implemented:
- ✅ **Authentication**: Sign up, sign in, sign out with JWT (httpOnly cookies)
- ✅ **Home Screen**: Items list with pagination, loading/empty/error states
- ✅ **Item Management**: Full CRUD operations (Create, Read, Update, Delete)
- ✅ **Security**: Password hashing, session persistence, user data isolation
- ✅ **Validation**: Input validation, error handling, form validation

📖 See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for detailed documentation.  
🚀 See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for quick start instructions.

## Project Structure

```
delty-assessment/
├── backend/              # Fastify API server
├── frontend/             # React + Vite application
├── infrastructure/       # AWS CDK infrastructure code
├── .github/workflows/    # CI/CD pipelines
└── README.md
```

## Tech Stack

### Backend
- **Runtime**: Node.js 20
- **Framework**: Fastify
- **Database**: PostgreSQL (Drizzle ORM)
- **Language**: TypeScript
- **Deployment**: AWS App Runner (Docker)

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS 4
- **UI Components**: Radix UI
- **State**: Zustand + React Query
- **Language**: TypeScript
- **Deployment**: AWS Amplify

### Infrastructure
- **IaC**: AWS CDK (TypeScript)
- **Database**: Amazon RDS PostgreSQL
- **Networking**: VPC, Subnets, Security Groups
- **Container Registry**: Amazon ECR
- **Backend Hosting**: AWS App Runner
- **Frontend Hosting**: AWS Amplify
- **Secrets**: AWS Secrets Manager

### CI/CD
- **Platform**: GitHub Actions
- **Workflows**: Build, test, deploy for all components

## Prerequisites

- Node.js 18+ 
- Yarn 3.6.4+
- Docker
- AWS CLI
- AWS CDK CLI

## Quick Start

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd delty-assessment
   yarn install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start local PostgreSQL:**
   ```bash
   docker run -d \
     -e POSTGRES_DB=delty_assessment \
     -e POSTGRES_PASSWORD=password \
     -p 5432:5432 \
     postgres:16
   ```

4. **Run migrations:**
   ```bash
   cd backend
   yarn db:migrate
   ```

5. **Start development servers:**
   ```bash
   # From root directory
   yarn dev
   ```

   This starts:
   - Backend: http://localhost:8080
   - Frontend: http://localhost:5173

### Individual Development

```bash
# Backend only
yarn dev:backend

# Frontend only
yarn dev:frontend
```

## Available Scripts

### Root Level

```bash
yarn install          # Install all dependencies
yarn dev             # Start both frontend and backend
yarn build           # Build all workspaces
yarn build:backend   # Build backend only
yarn build:frontend  # Build frontend only
yarn docker:backend  # Build backend Docker image
yarn deploy:infra    # Deploy infrastructure
yarn db:migrate      # Run database migrations
```

### Backend (`backend/`)

```bash
yarn dev             # Start dev server with hot reload
yarn build           # Build TypeScript
yarn start           # Start production server
yarn db:generate     # Generate database migrations
yarn db:migrate      # Run migrations
yarn db:studio       # Open Drizzle Studio
yarn docker:build    # Build Docker image
yarn docker:run      # Run Docker container
```

### Frontend (`frontend/`)

```bash
yarn dev             # Start dev server
yarn build           # Build for production
yarn build:prod      # Build with production optimizations
yarn preview         # Preview production build
yarn lint            # Run ESLint
yarn type-check      # Run TypeScript checks
```

### Infrastructure (`infrastructure/`)

```bash
yarn build           # Build CDK project
yarn synth           # Synthesize CloudFormation
yarn deploy:dev      # Deploy to development
yarn deploy:prod     # Deploy to production
yarn diff            # Show infrastructure diff
yarn destroy         # Destroy all stacks
```

## Deployment

See [DEPLOY.md](./DEPLOY.md) for step-by-step deployment instructions.

### Quick Deploy

```bash
# 1. Deploy infrastructure
cd infrastructure && yarn deploy:dev

# 2. Build and push backend
cd backend
docker build -t <ECR_URI>:latest .
docker push <ECR_URI>:latest

# 3. Run migrations
export DATABASE_URL="postgresql://..."
yarn db:migrate

# 4. Connect frontend to Amplify Console
# See DEPLOY.md for details
```

## Documentation

- [DEPLOY.md](./DEPLOY.md) - AWS deployment guide
- [backend/README.md](./backend/README.md) - Backend documentation
- [frontend/README.md](./frontend/README.md) - Frontend documentation
- [infrastructure/README.md](./infrastructure/README.md) - Infrastructure documentation

## Architecture

```
┌──────────┐
│  Users   │
└────┬─────┘
     │
     ├─────────────────────┐
     │                     │
     ▼                     ▼
┌─────────┐         ┌──────────┐
│ Amplify │         │   App    │
│Frontend │         │  Runner  │
└─────────┘         │ Backend  │
                    └────┬─────┘
                         │
                    ┌────▼────┐
                    │   VPC   │
                    │         │
                    │  ┌───┐  │
                    │  │RDS│  │
                    │  └───┘  │
                    └─────────┘
```

## Environment Variables

### Backend

```env
PORT=8080
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NODE_ENV=development
```

### Frontend

```env
VITE_API_URL=http://localhost:8080/api
VITE_ENV=development
```

### Infrastructure/AWS

```env
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
CDK_DEFAULT_ACCOUNT=123456789012
CDK_DEFAULT_REGION=us-east-1
```

## CI/CD Workflows

### CI (`ci.yml`)
- Runs on: Pull requests, pushes to main
- Actions: Build and lint all workspaces

### Deploy (`deploy.yml`)
- Runs on: Push to main, manual trigger
- Actions:
  - Backend: Build Docker → Push to ECR → Deploy to App Runner
  - Frontend: Build (Amplify auto-deploys from GitHub)

## Project Features

- ✅ Full TypeScript monorepo with Yarn workspaces
- ✅ Modern React with Vite and TailwindCSS
- ✅ Fast Fastify API with PostgreSQL
- ✅ Infrastructure as Code with AWS CDK
- ✅ Containerized backend with Docker
- ✅ Simple CI/CD with GitHub Actions
- ✅ Production-ready AWS architecture
- ✅ Database migrations with Drizzle
- ✅ Security best practices (VPC, Secrets Manager)
- ✅ Comprehensive documentation

## Development Workflow

1. Create feature branch
2. Make changes
3. Test locally with `yarn dev`
4. Commit and push
5. Create pull request (CI runs)
6. Merge to main (deployment workflows trigger)

## Testing

### Backend
```bash
cd backend
yarn build  # Type checking
docker build . # Docker build test
```

### Frontend
```bash
cd frontend
yarn type-check
yarn lint
yarn build
```

## Monitoring

- **App Runner**: CloudWatch Logs and metrics
- **RDS**: Performance Insights (prod)
- **Amplify**: Build and hosting logs
- **GitHub Actions**: Workflow run history

## Cost Estimate

### Development
- ~$65-95/month
  - RDS t3.micro
  - App Runner with scale-to-zero
  - Single NAT Gateway
  - Amplify free tier

### Production
- ~$258-358/month
  - RDS t3.small Multi-AZ
  - App Runner with higher capacity
  - 3 NAT Gateways
  - Higher traffic costs

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed cost breakdown.

## Troubleshooting

### Common Issues

**Backend won't connect to database:**
- Check DATABASE_URL format
- Verify VPC security groups
- Ensure App Runner VPC connector is attached

**Frontend API calls fail:**
- Verify VITE_API_URL is correct
- Check backend CORS configuration
- Ensure App Runner service is running

**CDK deployment fails:**
- Check IAM permissions
- Verify AWS account limits
- Review CloudFormation events

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC

## Support

For deployment help, see [DEPLOY.md](./DEPLOY.md).

For specific component documentation:
- Backend: [backend/README.md](./backend/README.md)
- Frontend: [frontend/README.md](./frontend/README.md)
- Infrastructure: [infrastructure/README.md](./infrastructure/README.md)
