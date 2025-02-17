#!/usr/bin/env bun
import * as cdk from "aws-cdk-lib";
import { ActionsStack } from "./stacks/ActionsStack";
import { TranslatorServiceStack } from "./stacks/";
import { getConfig } from "./helpers/getConfig";

const config = getConfig();

const app = new cdk.App();
new ActionsStack(app, "github-actions-stack", {
  stackName: "github-actions-stack",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  subjectClaim: "repo:soapy-codes/aws-deployments:environment:development",
});

// new TranslatorServiceStack(app, "TranslatorService", {
//   stackName: "TranslatorService",
//   env: {
//     account: config.awsAccountId,
//     region: config.awsRegion,
//   },
// });
