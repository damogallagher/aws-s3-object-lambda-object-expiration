#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { AwsS3ObjectLambdaObjectExpirationStack } from '../lib/aws-s3-object-lambda-object-expiration-stack';

const app = new cdk.App();
new AwsS3ObjectLambdaObjectExpirationStack(app, 'AwsS3ObjectLambdaObjectExpirationStack');
