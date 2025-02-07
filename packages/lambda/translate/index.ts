import * as clientTranslate from "@aws-sdk/client-translate";
import * as lambda from "aws-lambda";
import { TranslateRequest, TranslateResponse } from "../../shared-types/src";

const translateClient = new clientTranslate.TranslateClient({
  region: "us-east-2",
});

export const handler: lambda.APIGatewayProxyHandler = async (
  event: lambda.APIGatewayProxyEvent
) => {
  try {
    if (!event.body) {
      throw new Error("body is empty");
    }

    console.log(event.body);

    let body = JSON.parse(event.body) as TranslateRequest;
    const { sourceLang, targetLang, sourceText } = body;

    const now = new Date(Date.now()).toString();

    console.log(now);

    const translateCmd = new clientTranslate.TranslateTextCommand({
      SourceLanguageCode: sourceLang,
      TargetLanguageCode: targetLang,
      Text: sourceText,
    });

    const result = await translateClient.send(translateCmd);

    if (!result.TranslatedText) {
      throw new Error("translation has no text");
    }
    const response: TranslateResponse = {
      timestamp: now,
      targetText: result.TranslatedText,
    };
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify(response),
    };
  } catch (e: any) {
    console.error(e);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify(e.toString()),
    };
  }
};
