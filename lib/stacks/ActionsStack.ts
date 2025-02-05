import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";

export class ActionsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const oidcProvider = new iam.OpenIdConnectProvider(
      this,
      "GithubOidcProvider",
      {
        url: "https://token.actions.githubusercontent.com",
        clientIds: ["sts.amazonaws.com"],
      }
    );

    // const accessAnalyzerArtifactBucket = new s3.Bucket(
    //   this,
    //   "AccessAnalyzerArtifactBucket",
    //   {
    //     blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    //     encryption: s3.BucketEncryption.S3_MANAGED,
    //     versioned: false, // this would be true in enterprise
    //     removalPolicy: cdk.RemovalPolicy.DESTROY, // this would be RETAIN in enterprise
    //     autoDeleteObjects: true, // this would be false in enterprise
    //     minimumTLSVersion: 1.2,
    //     enforceSSL: true,
    //   }
    // );

    // const accessAnalyzerPermissionsPolicy = new iam.PolicyDocument({
    //   statements: [
    //     new iam.PolicyStatement({
    //       actions: [
    //         "iam:GetPolicy",
    //         "iam:GetPolicyVersion",
    //         "access-analyzer:ListAnalyzers",
    //         "access-analyzer:ValidatePolicy",
    //         "access-analyzer:CreateAccessPreview",
    //         "access-analyzer:GetAccessPreview",
    //         "access-analyzer:ListAccessPreviewFindings",
    //         "access-analyzer:CreateAnalyzer",
    //         "access-analyzer:CheckAccessNotGranted",
    //         "access-analyzer:CheckNoNewAccess",
    //         "s3:ListAllMyBuckets",
    //         "cloudformation:ListExports",
    //         "ssm:GetParameter",
    //         "cloudformation:CreateStack",
    //         "cloudformation:DescribeStacks",
    //         "cloudformation:CreateChangeSet",
    //         "cloudformation:DescribeChangeSet",
    //         "cloudformation:DeleteChangeSet",
    //         "cloudformation:ExecuteChangeSet",
    //         "iam:CreateRole",
    //         "iam:PutRolePolicy",
    //       ],
    //       effect: iam.Effect.ALLOW,
    //       resources: ["*"],
    //     }),
    //     new iam.PolicyStatement({
    //       actions: ["s3:ListObjects", "s3:GetObject", "s3:PutObject"],
    //       effect: iam.Effect.ALLOW,
    //       resources: [
    //         accessAnalyzerArtifactBucket.arnForObjects("*"),
    //         accessAnalyzerArtifactBucket.bucketArn,
    //       ],
    //     }),
    //   ],
    //   assignSids: true,
    // });

    const roleForGitHubActions = new iam.Role(this, "RoleForGitHubActions", {
      assumedBy: new iam.WebIdentityPrincipal(
        oidcProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            "token.actions.githubusercontent.com:sub":
              "repo:soapy-codes/aws-deployments:ref:refs/heads/main", // TODO
          },
        }
      ),
      //   inlinePolicies: {
      //     AccessAnalyzerPermissionsPolicy: accessAnalyzerPermissionsPolicy,
      //   },
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
      roleName: "github-role",
    });
  }
}
