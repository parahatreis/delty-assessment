# Deploy to AWS

Simple guide to deploy this app to AWS.

## Prerequisites

- AWS Account
- AWS CLI installed and configured (`aws configure`)
- Node.js 18+, Yarn, Docker
- GitHub repository

## Step 1: Deploy Infrastructure

```bash
# Install AWS CDK globally
npm install -g aws-cdk

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy infrastructure
cd infrastructure
yarn install
yarn deploy:dev
```

This creates:
- VPC and networking
- RDS PostgreSQL database
- ECR repository for Docker images
- App Runner service for backend

**Save these from the output:**
- ECR Repository URI
- App Runner Service URL
- App Runner Service ARN
- Database Secret ARN

## Step 2: Deploy Backend

```bash
# Get your ECR repository URI from Step 1
ECR_URI="<account-id>.dkr.ecr.<region>.amazonaws.com/delty-assessment-dev-backend"

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ECR_URI

# Build and push Docker image
cd backend
docker build -t $ECR_URI:latest .
docker push $ECR_URI:latest
```

App Runner automatically deploys the new image.

## Step 3: Run Database Migrations

```bash
# Get database credentials from Secrets Manager
SECRET_ARN="<from-step-1-output>"
SECRET=$(aws secretsmanager get-secret-value --secret-id $SECRET_ARN --query SecretString --output text)

# Extract credentials and build DATABASE_URL
DB_USER=$(echo $SECRET | jq -r .username)
DB_PASS=$(echo $SECRET | jq -r .password)
DB_HOST="<from-step-1-output>"  # Database endpoint

export DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:5432/delty_assessment"

# Run migrations
cd backend
yarn db:migrate
```

## Step 4: Deploy Frontend

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Connect your GitHub repository
4. Select branch: `main`
5. Build settings: Amplify auto-detects `amplify.yml`
6. Add environment variable:
   - `VITE_API_URL` = `https://<app-runner-url>/api`
7. **Save and deploy**

Your frontend is now live at: `https://main.<app-id>.amplifyapp.com`

## Step 5: Setup GitHub Actions

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

```
AWS_ACCESS_KEY_ID          - Your AWS access key
AWS_SECRET_ACCESS_KEY      - Your AWS secret key
AWS_REGION                 - us-east-1
APP_RUNNER_SERVICE_ARN     - From Step 1 output
ECR_REPOSITORY             - delty-assessment-dev-backend
VITE_API_URL              - https://<app-runner-url>/api
```

Now pushing to `main` automatically deploys backend and frontend!

## Quick Commands

### View backend logs
```bash
aws logs tail /aws/apprunner/delty-assessment-dev-backend/service --follow
```

### Redeploy backend manually
```bash
aws apprunner start-deployment --service-arn <service-arn>
```

### Update frontend environment variables
Go to Amplify Console → App Settings → Environment variables

### Destroy everything (cleanup)
```bash
cd infrastructure
yarn destroy
```

## Verify Deployment

```bash
# Test backend health
curl https://<app-runner-url>/api/health

# Test frontend
open https://<amplify-url>
```

## Production Deployment

For production, use:
```bash
cd infrastructure
yarn deploy:prod
```

This uses:
- Multi-AZ RDS
- Larger instance sizes
- Multiple NAT Gateways
- Deletion protection

## Troubleshooting

**Backend won't start?**
- Check CloudWatch logs in AWS Console
- Verify DATABASE_URL in App Runner environment variables

**Frontend build fails?**
- Check VITE_API_URL is set in Amplify
- Verify Node.js version is 20 in Amplify settings

**Database connection issues?**
- Database is private (no public access)
- Only App Runner can connect via VPC

## Cost Estimate

**Development:** ~$65-95/month
- RDS t3.micro
- App Runner (1 vCPU, 2GB)
- NAT Gateway

**Production:** ~$260-360/month
- RDS Multi-AZ
- App Runner (2 vCPU, 4GB)
- 3 NAT Gateways

## Local Development

```bash
# Start local database
docker run -d -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:16

# Set DATABASE_URL in backend/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/delty_assessment

# Run migrations
cd backend && yarn db:migrate

# Start dev servers
cd .. && yarn dev
```

Backend: http://localhost:8080  
Frontend: http://localhost:5173
