import * as cdk from "aws-cdk-lib";
import * as path from "path";
import type { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const projectRoot = "../";
    const lambdasDirPath = path.join(projectRoot, "packages/lambda");

    const translateLambdaPath = path.resolve(
      path.join(lambdasDirPath, "translate/index.ts")
    );

    // policy for the lambda execution role
    const translateAccessPolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });

    // lambda construct
    const lambdaFunc = new lambdaNodeJs.NodejsFunction(this, "timeOfDay", {
      entry: translateLambdaPath,
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      bundling: {
        externalModules: ["@aws-sdk/*"],
        minify: true,
        target: "es2020",
        sourceMap: true,
        metafile: true,
        mainFields: ["module", "main"],
        esbuildArgs: {
          "--tree-shaking": "true",
        },
      },
      initialPolicy: [translateAccessPolicy],
    });

    const restApi = new apigateway.RestApi(this, "timeOfDayRestAPI");
    restApi.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(lambdaFunc)
    );
  }
}
