import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";

export interface RestApiServiceProps extends cdk.StackProps {
  apiUrl: string;
  certificate: cdk.aws_certificatemanager.Certificate;
  zone: route53.IHostedZone;
}
export class RestApiService extends Construct {
  public restApi: apigateway.RestApi;
  constructor(
    scope: Construct,
    id: string,
    { apiUrl, certificate, zone }: RestApiServiceProps
  ) {
    super(scope, id);

    this.restApi = new apigateway.RestApi(this, "timeOfDayRestAPI", {
      domainName: {
        domainName: apiUrl,
        certificate,
      },
    });

    new route53.ARecord(this, "apiDns", {
      zone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(this.restApi)
      ),
      recordName: "api",
    });
  }

  addTranslateMethod({
    httpMethod,
    lambda,
  }: {
    httpMethod: string;
    lambda: cdk.aws_lambda.IFunction;
  }) {
    this.restApi.root.addMethod(
      httpMethod,
      new apigateway.LambdaIntegration(lambda)
    );
  }
}
