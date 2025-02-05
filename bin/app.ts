#!/usr/bin/env bun
import * as cdk from "aws-cdk-lib";
import { ActionsStack } from "../lib/stacks/ActionsStack";

const app = new cdk.App();
new ActionsStack(app, "GitHubActionsStack", {
  stackName: "GitHubActionsStack",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
