"use client";
import { Amplify } from "aws-amplify";

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_s3p8VhJEZ",
        userPoolClientId: "57nq7elbi22cejqo1cugagpkti",
      },
    },
  },
  {
    ssr: true,
  }
);

export function ConfigureAmplify() {
  return null;
}
