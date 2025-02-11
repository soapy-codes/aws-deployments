import * as path from "path";
import * as fs from "fs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { lambdasDirPath } from "./appPaths";

export interface LambdaWrapperProps {
  lambdaRelPath: string;
  handler: string;
  initialPolicy: Array<iam.PolicyStatement>;
  lambdaLayers: Array<lambda.ILayerVersion>;
  environment: Record<string, string>;
}
export const createNodeJsLambda = (
  scope: Construct,
  lambdaName: string,
  {
    lambdaRelPath,
    handler,
    initialPolicy,
    lambdaLayers,
    environment,
  }: LambdaWrapperProps
) => {
  const lambdaPath = path.join(lambdasDirPath, lambdaRelPath);

  if (!fs.existsSync(lambdaPath)) {
    throw new Error(`Lambda file ${lambdaPath} does not exist`);
  }

  return new lambdaNodeJs.NodejsFunction(scope, lambdaName, {
    entry: lambdaPath,
    handler,
    runtime: lambda.Runtime.NODEJS_20_X,
    bundling: {
      externalModules: ["@aws-sdk/*", "/opt/nodejs/utils-lambda-layer"],
      minify: true,
      target: "es2020",
      sourceMap: true,
      metafile: true,
      mainFields: ["module", "main"],
      esbuildArgs: {
        "--tree-shaking": "true",
      },
    },
    layers: lambdaLayers,
    initialPolicy,
    environment,
  });
};
