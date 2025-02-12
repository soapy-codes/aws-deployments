import * as cdk from "aws-cdk-lib";
import type { Construct } from "constructs";
import { getConfig } from "../helpers";

import {
  RestApiService,
  TranslationService,
  StaticWebsiteDeployment,
  CertificateWrapper,
  UserAuthSupportService,
} from "../constructs";

const config = getConfig();

export class TranslatorServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domain = config.domain;
    const webUrl = `${config.webSubdomain}.${domain}`;
    const apiUrl = `${config.apiSubdomain}.${domain}`;

    const certificateWrapper = new CertificateWrapper(
      this,
      "certificateWrapper",
      {
        domain,
        webUrl,
        apiUrl,
      }
    );

    const { certificate, zone } = certificateWrapper;

    // User auth support
    const userAuth = new UserAuthSupportService(this, "userAuthSupport");
    const restApi = new RestApiService(this, "restApi", {
      apiUrl,
      certificate,
      zone,
      userPool: userAuth.userPool,
    });

    new TranslationService(this, "translationService", {
      restApi,
    });

    new StaticWebsiteDeployment(this, "staticWebsiteDeployment", {
      domain,
      webUrl,
      certificate,
      zone,
    });
  }
}
