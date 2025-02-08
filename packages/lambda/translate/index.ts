import * as lambda from "aws-lambda";
import {
  TranslateDbObject,
  TranslateRequest,
  TranslateResponse,
} from "@a2t/shared-types";
import {
  gateway,
  getTranslation,
  exception,
  TranslationTable,
} from "/opt/nodejs/utils-lambda-layer";

const { TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;

if (!TABLE_NAME || !TRANSLATION_PARTITION_KEY) {
  throw new exception.MissingEnvironmentVariable("TABLE_NAME was not defined");
}

if (!TRANSLATION_PARTITION_KEY) {
  throw new exception.MissingEnvironmentVariable(
    "TRANSLATION_PARTITION_KEY was not defined"
  );
}

const translateTable = new TranslationTable({
  tableName: TABLE_NAME,
  partitionKey: TRANSLATION_PARTITION_KEY,
});

export const translate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new exception.MissingRequestBody();
    }

    console.log(event.body);

    let body = JSON.parse(event.body) as TranslateRequest;

    const { sourceLang, targetLang, sourceText } = body;

    if (!sourceLang) {
      throw new exception.MissingProperty("sourceLang");
    }
    if (!targetLang) {
      throw new exception.MissingProperty("sourceLang");
    }
    if (!sourceText) {
      throw new exception.MissingProperty("sourceLang");
    }

    const now = new Date(Date.now()).toString();

    console.log(now);

    const result = await getTranslation(body);

    if (!result.TranslatedText) {
      throw new exception.MissingProperty("TranslatedText");
    }
    const response: TranslateResponse = {
      timestamp: now,
      targetText: result.TranslatedText,
    };

    // persist into dynamodb

    const dto: TranslateDbObject = {
      requestId: context.awsRequestId,
      ...body,
      ...response,
    };

    await translateTable.insert(dto);

    return gateway.createSuccessJsonResponse(response);
  } catch (e: any) {
    return gateway.createErrorJsonResponse(e);
  }
};

export const getTranslations: lambda.APIGatewayProxyHandler = async (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) => {
  try {
    const records = await translateTable.getAll();
    return gateway.createSuccessJsonResponse(records);
  } catch (e: any) {
    return gateway.createErrorJsonResponse(e);
  }
};
