// make an empty cdk construct called UserAuthSupportService
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";

interface UserAuthSupportServiceProps extends cdk.StackProps {}
export class UserAuthSupportService extends Construct {
  userPool: cognito.UserPool;
  constructor(
    scope: Construct,
    id: string,
    props?: UserAuthSupportServiceProps
  ) {
    super(scope, id);

    this.userPool = new cognito.UserPool(this, "translatorUserPool", {
      selfSignUpEnabled: true,
      signInAliases: { email: true },

      autoVerify: { email: true },
      userPoolName: "translator-user-pool",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const client = new cognito.UserPoolClient(
      this,
      "translatorUserPoolClient",
      {
        userPool: this.userPool,
        userPoolClientName: "translator-web-client",
        generateSecret: false,
        supportedIdentityProviders: [
          cognito.UserPoolClientIdentityProvider.COGNITO,
        ],
      }
    );

    // create cfnOutputs for both the userPoolId and userPoolClientId
    new cdk.CfnOutput(this, "userPoolId", {
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "userPoolClientId", {
      value: client.userPoolClientId,
    });
  }
}
