#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PlanningPokerStack } from '../lib/planning-poker-stack.js';

const app = new cdk.App();
new PlanningPokerStack(app, 'PlanningPokerStack');
