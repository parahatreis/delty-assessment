export interface EnvironmentConfig {
  environment: 'dev';
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

const config: EnvironmentConfig = {
  environment: 'dev',
  region: process.env.AWS_REGION || 'us-east-1',
  projectName: 'delty-assessment',
  
  vpc: {
    maxAzs: 2,
    natGateways: 1,
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

export function getConfig(): EnvironmentConfig {
  return config;
}
