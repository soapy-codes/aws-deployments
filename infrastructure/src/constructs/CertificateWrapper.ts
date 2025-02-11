import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { StringAttributeConstraints } from "aws-cdk-lib/aws-cognito";

export interface CertificateWrapperProps extends cdk.StackProps {
  domain: string;
  webUrl: string;
  apiUrl: string;
}
export class CertificateWrapper extends Construct {
  public zone: route53.IHostedZone;
  public certificate: acm.Certificate;

  constructor(
    scope: Construct,
    id: string,
    { domain, webUrl, apiUrl }: CertificateWrapperProps
  ) {
    super(scope, id);

    this.zone = route53.HostedZone.fromLookup(this, "hostedZone", {
      domainName: domain,
    });

    this.certificate = new acm.Certificate(this, "certificate", {
      domainName: domain,
      subjectAlternativeNames: [webUrl, apiUrl],
      validation: acm.CertificateValidation.fromDns(this.zone),
    });
  }
}
