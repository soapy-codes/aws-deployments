import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as cognito from "aws-cdk-lib/aws-cognito";

export interface RestApiServiceProps extends cdk.StackProps {
  apiUrl: string;
  certificate: cdk.aws_certificatemanager.Certificate;
  zone: route53.IHostedZone;
  userPool?: cognito.UserPool;
}
export class RestApiService extends Construct {
  public restApi: apigateway.RestApi;
  public authorizer?: apigateway.CognitoUserPoolsAuthorizer;
  public publicResource: apigateway.Resource;
  public userResource: apigateway.Resource;
  constructor(
    scope: Construct,
    id: string,
    { apiUrl, certificate, zone, userPool }: RestApiServiceProps
  ) {
    super(scope, id);

    this.restApi = new apigateway.RestApi(this, "timeOfDayRestAPI", {
      domainName: {
        domainName: apiUrl,
        certificate,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
    });

    this.publicResource = this.restApi.root.addResource("public");
    this.userResource = this.restApi.root.addResource("user");

    if (userPool) {
      this.authorizer = new apigateway.CognitoUserPoolsAuthorizer(
        this.restApi,
        "cognitoAuthorizer",
        {
          cognitoUserPools: [userPool],
        }
      );
    }

    new route53.ARecord(this, "apiDns", {
      zone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(this.restApi)
      ),
      recordName: "api",
    });
  }

  addTranslateMethod({
    resource,
    httpMethod,
    lambda,
    isAuth,
  }: {
    resource: apigateway.Resource;
    httpMethod: string;
    lambda: cdk.aws_lambda.IFunction;
    isAuth: boolean;
  }) {
    let options: apigateway.MethodOptions = {};
    if (isAuth) {
      if (!this.authorizer) {
        throw new Error("Authorizer not set");
      }
      options = {
        authorizer: this.authorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      };
    }
    resource.addMethod(
      httpMethod,
      new apigateway.LambdaIntegration(lambda),
      options
    );
  }
}
