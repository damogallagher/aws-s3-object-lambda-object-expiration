import { Bucket, CfnAccessPoint } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { Stack } from '@aws-cdk/core';
import s3deploy = require('@aws-cdk/aws-s3-deployment');
import s3objectlambda = require('@aws-cdk/aws-s3objectlambda');
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';

export class AwsS3ObjectLambdaObjectExpirationStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const accountId = Stack.of(this).account;
    const region = Stack.of(this).region;

    const bucketName = `sample-bucket-${region}-${accountId}`
    const bucket = new Bucket(this, 'bucket', {
      bucketName: bucketName,
      publicReadAccess: true
    });
    console.log(bucket)

    new s3deploy.BucketDeployment(this, 'DeployKittens', {
      sources: [s3deploy.Source.asset('./s3Files/kittens')],
      destinationBucket: bucket,
      destinationKeyPrefix: 'kittens', // optional prefix in destination bucket
    });
    
    new s3deploy.BucketDeployment(this, 'DeployPuppies', {
      sources: [s3deploy.Source.asset('./s3Files/puppies')],
      destinationBucket: bucket,
      destinationKeyPrefix: 'puppies', // optional prefix in destination bucket
    });

    const kittensURL = bucket.virtualHostedUrlForObject('kittens/kitten.jpg'); // Virtual Hosted-Style URL
    const puppiesURL = bucket.virtualHostedUrlForObject('puppies/puppy.jpg'); // Virtual Hosted-Style URL

    new cdk.CfnOutput(this, 'S3KittensFile', { value: kittensURL });
    new cdk.CfnOutput(this, 'S3PuppiesFile', { value: puppiesURL });

    // See https://dev.to/aws-builders/creating-s3-object-lambda-with-cdk-for-c-24lo
 
    const lambdaFunction = new lambda.Function(this, 'MyFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'restrict-access.handler',
      code: lambda.Code.fromAsset('lambda'),
    });
    
    const accessPoint = new CfnAccessPoint(this, "S3AccessPoint", {
          bucket: bucketName,
          name: "s3-access-point"
    });

    const supportingAccessPoint = this.formatArn({
      service: 's3',
      resource: `accesspoint/${accessPoint.name}`
    });

    new s3objectlambda.CfnAccessPoint(this, 'AccessPoint', {
        name: 'restrictaccess',
        objectLambdaConfiguration: {
          allowedFeatures: [],
          cloudWatchMetricsEnabled: false,
          supportingAccessPoint: supportingAccessPoint,
          transformationConfigurations: [{
            actions:["GetObject"],
            contentTransformation: {AwsLambda: {FunctionArn: lambdaFunction.functionArn }}
          }]
        }
        //objectLambdaConfiguration:new CfnAccessPointProps().ObjectLambdaConfigurationProperty()
    
    });
  }
}
