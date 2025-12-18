# Deploy to AWS

Simple guide to deploy this app to AWS.

## Prerequisites

- AWS Account
- AWS CLI installed and configured (`aws configure`)
- Node.js 18+, Yarn, Docker

## Step 1: Deploy Network and Database

```bash
# Install AWS CDK globally
npm install -g aws-cdk

# Go to infrastructure directory
cd infrastructure

# Install dependencies
yarn install

# Build TypeScript files
yarn build

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy network and database (not backend yet)
yarn deploy:infra
```

This creates:
- VPC and networking
- RDS PostgreSQL database

**Save these from the output:**
- Database Secret ARN
- Database Endpoint

## Step 2: Build and Push Docker Image

First, create the ECR repository and push your backend image:

```bash
# Deploy backend stack (creates ECR + App Runner)
cd infrastructure
yarn deploy:backend
```

This creates:
- ECR repository
- App Runner service (will fail initially - that's expected)

**Get ECR URI from output, then:**

```bash
# Get your ECR repository URI from output
ECR_URI="<account-id>.dkr.ecr.<region>.amazonaws.com/delty-assessment-dev-backend"

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $ECR_URI

# Build and push Docker image
cd ../backend
docker build -t $ECR_URI:latest .
docker push $ECR_URI:latest

# Trigger App Runner deployment
aws apprunner start-deployment --service-arn <service-arn-from-output>
```

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

### Option A: Manual Build & Upload to S3

```bash
# Set backend URL
cd frontend
echo "VITE_API_URL=https://<app-runner-url>/api" > .env

# Build frontend
yarn build

# Upload to S3 (create bucket first if needed)
aws s3 mb s3://delty-assessment-frontend
aws s3 sync dist/ s3://delty-assessment-frontend --delete
aws s3 website s3://delty-assessment-frontend --index-document index.html
```

### Option B: Deploy via AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"** → **"Deploy without Git provider"**
3. Upload the `dist` folder from your build
4. Add environment variable:
   - `VITE_API_URL` = `https://<app-runner-url>/api`
5. **Deploy**

Your frontend is now live!

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

~$65-95/month
- RDS t3.micro
- App Runner (1 vCPU, 2GB)
- NAT Gateway

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
