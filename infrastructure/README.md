# Infrastructure

AWS CDK infrastructure for the delty-assessment project.

## Prerequisites

- Node.js 18+
- AWS CLI configured with credentials
- AWS CDK CLI: `npm install -g aws-cdk`
- Docker (for backend container builds)

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Bootstrap CDK (first time only):
```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

## Project Structure

```
infrastructure/
├── bin/
│   └── app.ts              # CDK app entry point
├── lib/
│   ├── config.ts           # Environment configurations
│   ├── network-stack.ts    # VPC, subnets, security groups
│   ├── database-stack.ts   # RDS PostgreSQL
│   └── backend-stack.ts    # App Runner, ECR
├── cdk.json                # CDK configuration
├── package.json
└── tsconfig.json
```

## Stacks

### Network Stack
- VPC with public, private, and isolated subnets
- NAT Gateway for private subnet internet access
- Security groups for App Runner and RDS

### Database Stack
- RDS PostgreSQL instance
- Automated backups and encryption
- Secrets Manager for credentials
- Multi-AZ for production

### Backend Stack
- ECR repository for Docker images
- App Runner service
- VPC connector for database access
- Health check configuration

## Commands

### Development

```bash
# Synthesize CloudFormation templates
yarn synth

# Deploy all stacks to development
yarn deploy:dev

# Deploy all stacks to production
yarn deploy:prod

# View differences
yarn diff

# Destroy all stacks
yarn destroy
```

### Specific Stack Operations

```bash
# Deploy specific stack
cdk deploy delty-assessment-dev-network

# List all stacks
cdk list

# View stack outputs
aws cloudformation describe-stacks --stack-name delty-assessment-dev-backend
```

## Environment Configuration

The infrastructure supports multiple environments:
- **dev**: Development environment (cost-optimized)
- **staging**: Staging environment (similar to dev)
- **prod**: Production environment (high availability)

Environments are configured in `lib/config.ts`.

## Outputs

After deployment, the following outputs are available:

- **VPC ID**: Virtual Private Cloud identifier
- **Database Endpoint**: RDS connection endpoint
- **Database Secret ARN**: Credentials in Secrets Manager
- **ECR Repository URI**: Docker image repository
- **App Runner Service URL**: Backend API endpoint

View outputs:
```bash
aws cloudformation describe-stacks --stack-name STACK-NAME --query 'Stacks[0].Outputs'
```

## Cost Considerations

**Development**:
- t3.micro RDS instance
- Single NAT Gateway
- App Runner with low min/max instances

**Production**:
- t3.small RDS instance (or larger)
- Multiple NAT Gateways for HA
- Multi-AZ RDS
- Higher App Runner capacity

## Security

- Database in private isolated subnets
- No public access to RDS
- Security groups restrict traffic
- Encrypted storage and backups
- Secrets in AWS Secrets Manager
- IAM roles with least privilege

## Troubleshooting

### CDK Bootstrap Error
```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
```

### Permission Errors
Ensure your AWS credentials have sufficient permissions for:
- VPC, EC2, RDS, ECR, App Runner, Secrets Manager, IAM

### Stack Dependencies
Stacks must be deployed in order:
1. Network Stack
2. Database Stack
3. Backend Stack

## Next Steps

1. Deploy infrastructure: `yarn deploy:dev`
2. Build and push backend Docker image (see backend/README.md)
3. Configure GitHub Actions with AWS credentials
4. Set up Amplify for frontend (see frontend/README.md)
