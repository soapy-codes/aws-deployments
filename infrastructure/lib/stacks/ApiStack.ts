import * as cdk from "aws-cdk-lib";
import * as path from "path";
import type { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as acm from "aws-cdk-lib/aws-certificatemanager";

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domain = "bazaar.builders";
    const fullUrl = `www.${domain}`;
    const apiUrl = `api.${domain}`;

    // Import hosted zone created in console
    const zone = route53.HostedZone.fromLookup(this, "hosted-zone", {
      domainName: domain,
    });

    // Create SSL certificate
    const certificate = new acm.Certificate(this, "certificate", {
      domainName: domain,
      subjectAlternativeNames: [fullUrl, apiUrl],
      validation: acm.CertificateValidation.fromDns(zone),
    });

    // viewer certificate
    const viewerCertificate = cloudfront.ViewerCertificate.fromAcmCertificate(
      certificate,
      {
        aliases: [domain, fullUrl],
      }
    );

    const projectRoot = "../";
    const lambdasDirPath = path.join(projectRoot, "packages/lambda");
    const lambdaLayersDirPath = path.join(
      projectRoot,
      "packages/lambda-layers"
    );

    const translateLambdaPath = path.resolve(
      path.join(lambdasDirPath, "translate/index.ts")
    );
    const utilsLambdaLayerPath = path.resolve(
      path.join(lambdaLayersDirPath, "utils-lambda-layer")
    );

    console.log(utilsLambdaLayerPath);

    const utilsLambdaLayer = new lambda.LayerVersion(this, "utilsLambdaLayer", {
      code: lambda.Code.fromAsset(utilsLambdaLayerPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    //DynamoDb construct
    const table = new dynamodb.Table(this, "translations", {
      tableName: "translation",
      partitionKey: {
        name: "requestId",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // policy for the lambda execution role
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

    const restApi = new apigateway.RestApi(this, "timeOfDayRestAPI", {
      domainName: {
        domainName: apiUrl,
        certificate,
      },
    });
    // lambda construct

    const translateLambda = new lambdaNodeJs.NodejsFunction(
      this,
      "translateLambda",
      {
        entry: translateLambdaPath,
        handler: "translate",
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
        layers: [utilsLambdaLayer],
        initialPolicy: [translateAccessPolicy, dynamodbAccessPolicy],
        environment: {
          TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );

    const getTranslationsLambda = new lambdaNodeJs.NodejsFunction(
      this,
      "getTranslationsLambda",
      {
        entry: translateLambdaPath,
        handler: "getTranslations",
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
        layers: [utilsLambdaLayer],
        initialPolicy: [dynamodbAccessPolicy],
        environment: {
          TABLE_NAME: table.tableName,
          TRANSLATION_PARTITION_KEY: "requestId",
        },
      }
    );

    restApi.root.addMethod(
      "POST",
      new apigateway.LambdaIntegration(translateLambda)
    );
    restApi.root.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getTranslationsLambda)
    );

    // public bucket for hosting static website
    const bucket = new s3.Bucket(this, "websiteBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "404.html",
      bucketName: "a2t-static-nextjs-frontend",
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
    });

    // cloudfront distro
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "distribution",
      {
        viewerCertificate,
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
      }
    );
    // s3 construct to deploy dist directory
    new s3deploy.BucketDeployment(this, "websiteDeploy", {
      destinationBucket: bucket,
      sources: [s3deploy.Source.asset("../frontend/dist")],
      distribution,
      distributionPaths: ["/*"],
    });

    new route53.ARecord(this, "route53Domain", {
      zone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
      recordName: domain,
    });

    new route53.ARecord(this, "route53FullUrl", {
      zone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
      recordName: "www",
    });

    new route53.ARecord(this, "apiDns", {
      zone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(restApi)
      ),
      recordName: "api",
    });

    new cdk.CfnOutput(this, "webUrl", {
      exportName: "webUrl",
      value: `https://${distribution.distributionDomainName}`,
    });
  }
}
