import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './config';

export interface DatabaseStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
}

export class DatabaseStack extends cdk.Stack {
  public readonly database: rds.DatabaseInstance;
  public readonly secret: secretsmanager.Secret;
  public readonly databaseUrl: string;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    const { config, vpc, securityGroup } = props;

    // Create database credentials secret
    this.secret = new secretsmanager.Secret(this, 'DatabaseSecret', {
      secretName: `${config.projectName}-${config.environment}-db-credentials`,
      description: 'RDS PostgreSQL database credentials',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'postgres',
        }),
        generateStringKey: 'password',
        excludePunctuation: true,
        passwordLength: 32,
      },
    });

    // Create RDS PostgreSQL instance
    this.database = new rds.DatabaseInstance(this, 'Database', {
      databaseName: config.projectName.replace(/-/g, '_'),
      instanceIdentifier: `${config.projectName}-${config.environment}-db`,
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_6,
      }),
      instanceType: new ec2.InstanceType(config.database.instanceType),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      securityGroups: [securityGroup],
      credentials: rds.Credentials.fromSecret(this.secret),
      allocatedStorage: config.database.allocatedStorage,
      maxAllocatedStorage: config.database.maxAllocatedStorage,
      storageEncrypted: true,
      backupRetention: cdk.Duration.days(config.database.backupRetention),
      deleteAutomatedBackups: true,
      multiAz: config.database.multiAz,
      deletionProtection: config.database.deletionProtection,
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
      enablePerformanceInsights: false,
      cloudwatchLogsExports: ['postgresql'],
      publiclyAccessible: false,
    });

    // Construct DATABASE_URL for the application
    const dbUsername = this.secret.secretValueFromJson('username').unsafeUnwrap();
    const dbPassword = this.secret.secretValueFromJson('password').unsafeUnwrap();
    this.databaseUrl = `postgresql://${dbUsername}:${dbPassword}@${this.database.dbInstanceEndpointAddress}:${this.database.dbInstanceEndpointPort}/${config.projectName.replace(/-/g, '_')}`;

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.dbInstanceEndpointAddress,
      description: 'RDS Database Endpoint',
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.secret.secretArn,
      description: 'Database Credentials Secret ARN',
    });
  }
}
