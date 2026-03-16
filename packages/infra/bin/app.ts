#!/usr/bin/env node
import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';
import { PlanningPokerStack } from '../lib/planning-poker-stack.js';

const app = new cdk.App();
new PlanningPokerStack(app, 'PlanningPokerStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
    certificateArn: process.env.CERTIFICATE_ARN,
    domainName: process.env.DOMAIN_NAME,
    hostedZoneName: process.env.HOSTED_ZONE_NAME,
    webAclArn: process.env.WEB_ACL_ARN,
});
