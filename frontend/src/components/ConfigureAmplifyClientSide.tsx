"use client";
import { Amplify } from "aws-amplify";

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: "us-east-1_5se9zN1rp",
        userPoolClientId: "4eoejc7tic1d3vci8roopntomp",
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
