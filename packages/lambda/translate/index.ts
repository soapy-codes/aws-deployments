import * as clientTranslate from "@aws-sdk/client-translate";
import * as lambda from "aws-lambda";
import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  TranslateDbObject,
  TranslateRequest,
  TranslateResponse,
} from "../../shared-types/src";

const translateClient = new clientTranslate.TranslateClient({
  region: "us-east-2",
});

const dynamodbClient = new dynamodb.DynamoDBClient({
  region: "us-east-2",
});

const { TABLE_NAME, TRANSLATION_PARTITION_KEY } = process.env;

if (!TABLE_NAME || !TRANSLATION_PARTITION_KEY) {
  throw new Error("TABLE_NAME was not defined");
}

if (!TRANSLATION_PARTITION_KEY) {
  throw new Error("TRANSLATION_PARTITION_KEY was not defined");
}

export const translate: lambda.APIGatewayProxyHandler = async (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
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

    // persist into dynamodb

    const dto: TranslateDbObject = {
      requestId: context.awsRequestId,
      ...body,
      ...response,
    };

    const tableInsertCmd: dynamodb.PutItemCommandInput = {
      TableName: TABLE_NAME,
      Item: marshall(dto),
    };
    await dynamodbClient.send(new dynamodb.PutItemCommand(tableInsertCmd));

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

export const getTranslations: lambda.APIGatewayProxyHandler = async (
  event: lambda.APIGatewayProxyEvent,
  context: lambda.Context
) => {
  try {
    const scanCmd: dynamodb.ScanCommandInput = {
      TableName: TABLE_NAME,
    };

    console.log("scanCmd", scanCmd);

    const { Items } = await dynamodbClient.send(
      new dynamodb.ScanCommand(scanCmd)
    );

    if (!Items) {
      throw new Error("no items found");
    }

    const records = Items.map((item) => {
      console.log(item);
      return unmarshall(item) as TranslateDbObject;
    });
    console.log(records);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify(records),
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
