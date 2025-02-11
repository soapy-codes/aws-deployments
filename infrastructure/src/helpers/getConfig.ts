import * as dotenv from "dotenv";
import { AppConfig } from "./AppTypes";

export const getConfig = (): AppConfig => {
  dotenv.config({ path: "../.env" });
  const { AWS_ACCOUNT_ID, AWS_REGION, DOMAIN, API_SUBDOMAIN, WEB_SUBDOMAIN } =
    process.env;

  // Check each required environment variable
  if (!AWS_ACCOUNT_ID) throw new Error("AWS_ACCOUNT_ID is not set");
  if (!AWS_REGION) throw new Error("AWS_REGION is not set");
  if (!DOMAIN) throw new Error("DOMAIN is not set");
  if (!API_SUBDOMAIN) throw new Error("API_SUBDOMAIN is not set");
  if (!WEB_SUBDOMAIN) throw new Error("WEB_SUBDOMAIN is not set");

  // return an AppConfig instance populated with the values
  return {
    awsAccountId: AWS_ACCOUNT_ID,
    awsRegion: AWS_REGION,
    domain: DOMAIN,
    apiSubdomain: API_SUBDOMAIN,
    webSubdomain: WEB_SUBDOMAIN,
  };
};
