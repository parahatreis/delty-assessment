#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { DatabaseStack } from '../lib/database-stack';
import { BackendStack } from '../lib/backend-stack';
import { getConfig } from '../lib/config';

const app = new cdk.App();

// Get configuration
const config = getConfig();

// Stack environment
const env = {
  account: config.account || process.env.CDK_DEFAULT_ACCOUNT,
  region: config.region || process.env.CDK_DEFAULT_REGION || 'us-east-1',
};

// Create Network Stack
const networkStack = new NetworkStack(app, `${config.projectName}-${config.environment}-network`, {
  env,
  config,
  description: `Network infrastructure for ${config.projectName} ${config.environment}`,
});

// Create Database Stack
const databaseStack = new DatabaseStack(app, `${config.projectName}-${config.environment}-database`, {
  env,
  config,
  vpc: networkStack.vpc,
  securityGroup: networkStack.databaseSecurityGroup,
  description: `Database infrastructure for ${config.projectName} ${config.environment}`,
});
databaseStack.addDependency(networkStack);

// Create Backend Stack
const backendStack = new BackendStack(app, `${config.projectName}-${config.environment}-backend`, {
  env,
  config,
  vpc: networkStack.vpc,
  securityGroup: networkStack.appRunnerSecurityGroup,
  databaseUrl: databaseStack.databaseUrl,
  databaseSecretArn: databaseStack.secret.secretArn,
  description: `Backend infrastructure for ${config.projectName} ${config.environment}`,
});
backendStack.addDependency(databaseStack);

app.synth();
