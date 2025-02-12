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
        name: "username",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
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
        "dynamodb:Query",
      ],
      resources: ["*"],
    });

    const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
      code: lambda.Code.fromAsset(utilsLambdaLayerPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const environment = {
      TABLE_NAME: table.tableName,
      TRANSLATION_PARTITION_KEY: "username",
      TRANSLATION_SORT_KEY: "requestId",
    };

    const translateLambda = createNodeJsLambda(this, "translateLambda", {
      lambdaRelPath: "translate/index.ts",
      handler: "userTranslate",
      lambdaLayers: [utilsLambdaLayer],
      initialPolicy: [translateAccessPolicy, dynamodbAccessPolicy],
      environment,
    });
    restApi.addTranslateMethod({
      resource: restApi.userResource,
      httpMethod: "POST",
      lambda: translateLambda,
      isAuth: true,
    });

    const getTranslationsLambda = createNodeJsLambda(
      this,
      "getTranslationsLambda",
      {
        lambdaRelPath: "translate/index.ts",
        handler: "getUserTranslations",
        lambdaLayers: [utilsLambdaLayer],
        initialPolicy: [dynamodbAccessPolicy],
        environment,
      }
    );
    restApi.addTranslateMethod({
      resource: restApi.userResource,
      httpMethod: "GET",
      lambda: getTranslationsLambda,
      isAuth: true,
    });

    const deleteTranslationLambda = createNodeJsLambda(
      this,
      "deleteTranslationLambda",
      {
        lambdaRelPath: "translate/index.ts",
        handler: "deleteUserTranslation",
        lambdaLayers: [utilsLambdaLayer],
        initialPolicy: [dynamodbAccessPolicy],
        environment,
      }
    );
    restApi.addTranslateMethod({
      resource: restApi.userResource,
      httpMethod: "DELETE",
      lambda: deleteTranslationLambda,
      isAuth: true,
    });

    const publicTranslationLambda = createNodeJsLambda(
      this,
      "publicTranslationLambda",
      {
        lambdaRelPath: "translate/index.ts",
        handler: "publicTranslate",
        lambdaLayers: [utilsLambdaLayer],
        initialPolicy: [translateAccessPolicy],
        environment,
      }
    );
    restApi.addTranslateMethod({
      resource: restApi.publicResource,
      httpMethod: "POST",
      lambda: publicTranslationLambda,
      isAuth: false,
    });
  }
}
