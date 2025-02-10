#!/usr/bin/env bun
import * as cdk from "aws-cdk-lib";
import { ActionsStack } from "../lib/stacks/ActionsStack";
import { ApiStack } from "../lib/stacks/ApiStack";

const app = new cdk.App();
// new ActionsStack(app, "GitHubActionsStack", {
//   stackName: "GitHubActionsStack",
//   env: {
//     account: process.env.CDK_DEFAULT_ACCOUNT,
//     region: process.env.CDK_DEFAULT_REGION,
//   },
// });

new ApiStack(app, "ApiStack", {
  stackName: "ApiStack",
  env: {
    account: "851725624479",
    region: "us-east-1",
  },
});
