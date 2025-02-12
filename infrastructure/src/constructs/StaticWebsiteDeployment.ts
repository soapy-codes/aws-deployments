import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import { frontendDirPath } from "../helpers";

interface StaticWebsiteDeploymentProps {
  domain: string;
  webUrl: string;
  certificate: acm.Certificate;
  zone: route53.IHostedZone;
}
export class StaticWebsiteDeployment extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { domain, webUrl, certificate, zone }: StaticWebsiteDeploymentProps
  ) {
    super(scope, id);
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
    // viewer certificate
    const viewerCertificate = cloudfront.ViewerCertificate.fromAcmCertificate(
      certificate,
      {
        aliases: [domain, webUrl],
      }
    );
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
      sources: [s3deploy.Source.asset(frontendDirPath)],
      distribution,
      distributionPaths: ["/*"],
      memoryLimit: 512,
    });

    new route53.ARecord(this, "route53Domain", {
      zone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
      recordName: domain,
    });

    new route53.ARecord(this, "route53WebUrl", {
      zone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
      recordName: "www",
    });
  }
}
