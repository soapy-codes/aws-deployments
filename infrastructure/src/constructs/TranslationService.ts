import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { RestApiService } from "./RestApiService";
import { createNodeJsLambda, lambdaLayersDirPath } from "../helpers";

export interface TranslationServiceProps extends cdk.StackProps {
  restApi: RestApiService;
}
export class TranslationService extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { restApi }: TranslationServiceProps
  ) {
    super(scope, id);

    const utilsLambdaLayerPath = path.resolve(
      path.join(lambdaLayersDirPath, "utils-lambda-layer")
    );

    const table = new dynamodb.Table(this, "translations", {
      tableName: "translation",
      partitionKey: {
        name: "requestId",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const translateAccessPolicy = new iam.PolicyStatement({
      actions: ["translate:TranslateText"],
      resources: ["*"],
    });
    const dynamodbAccessPolicy = new iam.PolicyStatement({
      actions: [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan",
      ],
      resources: ["*"],
    });

    const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
      code: lambda.Code.fromAsset(utilsLambdaLayerPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const translateLambda = createNodeJsLambda(this, "translateLambda", {
      lambdaRelPath: "translate/index.ts",
      handler: "translate",
      lambdaLayers: [utilsLambdaLayer],
      initialPolicy: [translateAccessPolicy, dynamodbAccessPolicy],
      environment: {
        TABLE_NAME: table.tableName,
        TRANSLATION_PARTITION_KEY: "requestId",
      },
    });
    restApi.addTranslateMethod({
      httpMethod: "POST",
      lambda: translateLambda,
    });

    const getTranslationsLambda = createNodeJsLambda(
      this,
      "getTranslationsLambda",
      {
        lambdaRelPath: "translate/index.ts",
        handler: "getTranslations",
        lambdaLayers: [utilsLambdaLayer],
        initialPolicy: [dynamodbAccessPolicy],
        environment: {
          TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );
    restApi.addTranslateMethod({
      httpMethod: "GET",
      lambda: getTranslationsLambda,
    });
  }
}
