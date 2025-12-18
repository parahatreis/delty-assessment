import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from './config';

export interface BackendStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
  vpc: ec2.Vpc;
  securityGroup: ec2.SecurityGroup;
  databaseUrl: string;
  databaseSecretArn: string;
}

export class BackendStack extends cdk.Stack {
  public readonly repository: ecr.IRepository;
  public readonly service: apprunner.CfnService;
  public readonly serviceUrl: string;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const { config, vpc, securityGroup, databaseUrl, databaseSecretArn } = props;

    // Reference existing ECR repository
    this.repository = ecr.Repository.fromRepositoryName(
      this,
      'BackendRepository',
      `${config.projectName}-${config.environment}-backend`
    );

    // Create IAM role for App Runner instance
    const instanceRole = new iam.Role(this, 'InstanceRole', {
      roleName: `${config.projectName}-${config.environment}-apprunner-instance-role`,
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
      description: 'App Runner instance role for accessing AWS services',
    });

    // Grant access to Secrets Manager
    instanceRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'secretsmanager:GetSecretValue',
          'secretsmanager:DescribeSecret',
        ],
        resources: [databaseSecretArn],
      })
    );

    // Create IAM role for App Runner service (for pulling from ECR)
    const accessRole = new iam.Role(this, 'AccessRole', {
      roleName: `${config.projectName}-${config.environment}-apprunner-access-role`,
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
      description: 'App Runner access role for pulling images from ECR',
    });

    // Grant ECR pull permissions
    this.repository.grantPull(accessRole);

    // Create VPC Connector for App Runner
    const vpcConnector = new apprunner.CfnVpcConnector(this, 'VpcConnector', {
      vpcConnectorName: `${config.projectName}-${config.environment}-vpc-connector`,
      subnets: vpc.selectSubnets({
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      }).subnetIds,
      securityGroups: [securityGroup.securityGroupId],
    });

    // Create App Runner Service
    this.service = new apprunner.CfnService(this, 'Service', {
      serviceName: `${config.projectName}-${config.environment}-backend`,
      sourceConfiguration: {
        authenticationConfiguration: {
          accessRoleArn: accessRole.roleArn,
        },
        imageRepository: {
          imageIdentifier: `${this.repository.repositoryUri}:latest`,
          imageRepositoryType: 'ECR',
          imageConfiguration: {
            port: config.appRunner.port.toString(),
            runtimeEnvironmentVariables: [
              {
                name: 'NODE_ENV',
                value: 'production',
              },
              {
                name: 'PORT',
                value: config.appRunner.port.toString(),
              },
              {
                name: 'DATABASE_URL',
                value: databaseUrl,
              },
              {
                name: 'JWT_SECRET',
                value: process.env.JWT_SECRET || 'fallback-secret-change-me',
              },
            ],
          },
        },
      },
      instanceConfiguration: {
        cpu: config.appRunner.cpu.toString(),
        memory: config.appRunner.memory.toString(),
        instanceRoleArn: instanceRole.roleArn,
      },
      healthCheckConfiguration: {
        protocol: 'HTTP',
        path: '/api/health',
        interval: 10,
        timeout: 5,
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      },
      networkConfiguration: {
        egressConfiguration: {
          egressType: 'VPC',
          vpcConnectorArn: vpcConnector.attrVpcConnectorArn,
        },
      },
    });

    this.service.addDependency(vpcConnector);

    this.serviceUrl = `https://${this.service.attrServiceUrl}`;

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'RepositoryUri', {
      value: this.repository.repositoryUri,
      description: 'ECR Repository URI',
    });

    new cdk.CfnOutput(this, 'ServiceUrl', {
      value: this.serviceUrl,
      description: 'App Runner Service URL',
    });

    new cdk.CfnOutput(this, 'ServiceArn', {
      value: this.service.attrServiceArn,
      description: 'App Runner Service ARN',
    });
  }
}
