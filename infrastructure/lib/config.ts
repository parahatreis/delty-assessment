export interface EnvironmentConfig {
  environment: 'dev' | 'staging' | 'prod';
  region: string;
  account?: string;
  
  // Naming
  projectName: string;
  
  // VPC Configuration
  vpc: {
    maxAzs: number;
    natGateways: number;
  };
  
  // Database Configuration
  database: {
    instanceType: string;
    allocatedStorage: number;
    maxAllocatedStorage: number;
    backupRetention: number;
    multiAz: boolean;
    deletionProtection: boolean;
  };
  
  // App Runner Configuration
  appRunner: {
    cpu: number;
    memory: number;
    port: number;
  };
}

const devConfig: EnvironmentConfig = {
  environment: 'dev',
  region: process.env.AWS_REGION || 'us-east-1',
  projectName: 'delty-assessment',
  
  vpc: {
    maxAzs: 2,
    natGateways: 1, // Cost optimization for dev
  },
  
  database: {
    instanceType: 't3.micro',
    allocatedStorage: 20,
    maxAllocatedStorage: 100,
    backupRetention: 7,
    multiAz: false,
    deletionProtection: false,
  },
  
  appRunner: {
    cpu: 1024, // 1 vCPU
    memory: 2048, // 2 GB
    port: 8080,
  },
};

const prodConfig: EnvironmentConfig = {
  environment: 'prod',
  region: process.env.AWS_REGION || 'us-east-1',
  projectName: 'delty-assessment',
  
  vpc: {
    maxAzs: 3,
    natGateways: 3, // High availability
  },
  
  database: {
    instanceType: 't3.small',
    allocatedStorage: 100,
    maxAllocatedStorage: 500,
    backupRetention: 30,
    multiAz: true,
    deletionProtection: true,
  },
  
  appRunner: {
    cpu: 2048, // 2 vCPU
    memory: 4096, // 4 GB
    port: 8080,
  },
};

export function getConfig(environment?: string): EnvironmentConfig {
  const env = environment || process.env.ENVIRONMENT || 'dev';
  
  switch (env) {
    case 'prod':
    case 'production':
      return prodConfig;
    case 'staging':
      return { ...devConfig, environment: 'staging' };
    case 'dev':
    case 'development':
    default:
      return devConfig;
  }
}
