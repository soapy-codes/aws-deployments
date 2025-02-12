import * as lambda from "aws-lambda";
import {
  TranslateResult,
  TranslateRequest,
  TranslateResponse,
} from "@a2t/shared-types";
import {
  gateway,
  getTranslation,
  exception,
  TranslationTable,
} from "/opt/nodejs/utils-lambda-layer";

const { TABLE_NAME, TRANSLATION_PARTITION_KEY, TRANSLATION_SORT_KEY } =
  process.env;

if (!TABLE_NAME || !TRANSLATION_PARTITION_KEY) {
  throw new exception.MissingEnvironmentVariable("TABLE_NAME was not defined");
}

if (!TRANSLATION_PARTITION_KEY) {
  throw new exception.MissingEnvironmentVariable(
    "TRANSLATION_PARTITION_KEY was not defined"
  );
}

if (!TRANSLATION_SORT_KEY) {
  throw new exception.MissingEnvironmentVariable(
    "TRANSLATION_SORT_KEY was not defined"
  );
}
const translateTable = new TranslationTable({
  tableName: TABLE_NAME,
  partitionKey: TRANSLATION_PARTITION_KEY,
  sortKey: TRANSLATION_SORT_KEY,
});

const getUsername = (event: lambda.APIGatewayProxyEvent) => {
  const claims = event.requestContext.authorizer?.claims;
  if (!claims) {
    throw new Error("user not authenticated");
  }

  const username = claims["cognito:username"];
  if (!username) {
    throw new Error("username does not exist");
  }

  return username;
};

const parseTranslateRequest = (eventBody: string) => {
  let request = JSON.parse(eventBody) as TranslateRequest;

  const { sourceLang, targetLang, sourceText } = request;

  if (!sourceLang) {
    throw new exception.MissingProperty("sourceLang");
  }
  if (!targetLang) {
    throw new exception.MissingProperty("sourceLang");
  }
  if (!sourceText) {
    throw new exception.MissingProperty("sourceLang");
  }

  return request;
};

const getCurrentTime = () => {
  return Date.now();
};
const formatTime = (time: number) => {
  return new Date(time).toString();
};

export const publicTranslate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new exception.MissingRequestBody();
    }

    const request = parseTranslateRequest(event.body);
    console.log("parsed request", request);

    const nowEpoch = getCurrentTime();
    console.log("nowEpoch", nowEpoch);

    const targetText = await getTranslation(request);
    console.log("targetText", targetText);

    const response: TranslateResponse = {
      timestamp: formatTime(nowEpoch),
      targetText,
    };

    const result: TranslateResult = {
      requestId: nowEpoch.toString(),
      username: "",
      ...request,
      ...response,
    };

    return gateway.createSuccessJsonResponse(result);
  } catch (e: any) {
    return gateway.createErrorJsonResponse(e);
  }
};

export const userTranslate: lambda.APIGatewayProxyHandler = async function (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) {
  try {
    if (!event.body) {
      throw new exception.MissingRequestBody();
    }

    const username = getUsername(event);

    const request = parseTranslateRequest(event.body);
    console.log("parsed request", request);

    const nowEpoch = getCurrentTime();
    console.log("nowEpoch", nowEpoch);

    const targetText = await getTranslation(request);
    console.log("targetText", targetText);

    const response: TranslateResponse = {
      timestamp: formatTime(nowEpoch),
      targetText,
    };

    // persist into dynamodb

    const result: TranslateResult = {
      requestId: nowEpoch.toString(),
      username,
      ...request,
      ...response,
    };

    await translateTable.insert(result);

    return gateway.createSuccessJsonResponse(result);
  } catch (e: any) {
    return gateway.createErrorJsonResponse(e);
  }
};

export const getUserTranslations: lambda.APIGatewayProxyHandler = async (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) => {
  try {
    const username = getUsername(event);
    const records = await translateTable.query({ username, requestId: "" });
    return gateway.createSuccessJsonResponse(records);
  } catch (e: any) {
    return gateway.createErrorJsonResponse(e);
  }
};

const parseDeleteRequest = (eventBody: string) => {
  const request = JSON.parse(eventBody) as { requestId: string };
  if (!request.requestId) {
    throw new exception.MissingProperty("requestId");
  }
  return request;
};

export const deleteUserTranslation: lambda.APIGatewayProxyHandler = async (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) => {
  try {
    if (!event.body) {
      throw new exception.MissingRequestBody();
    }

    const username = getUsername(event);
    console.log("username: ", username);
    const { requestId } = parseDeleteRequest(event.body);
    console.log("requestId: ", requestId);
    const data = await translateTable.delete({ username, requestId });

    return gateway.createSuccessJsonResponse(data);
  } catch (e: any) {
    return gateway.createErrorJsonResponse(e);
  }
};
