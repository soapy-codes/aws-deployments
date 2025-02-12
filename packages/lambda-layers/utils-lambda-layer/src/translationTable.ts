import { TranslatePrimaryKey, TranslateResult } from "@a2t/shared-types";
import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export class TranslationTable {
  readonly tableName: string;
  readonly partitionKey: string;
  readonly sortKey: string;
  dynamodbClient: dynamodb.DynamoDBClient;

  constructor({
    tableName,
    partitionKey,
    sortKey,
  }: {
    tableName: string;
    partitionKey: string;
    sortKey: string;
  }) {
    this.tableName = tableName;
    this.partitionKey = partitionKey;
    this.sortKey = sortKey;
    this.dynamodbClient = new dynamodb.DynamoDBClient();
  }

  insert = async (dto: TranslateResult) => {
    const tableInsertCmd: dynamodb.PutItemCommandInput = {
      TableName: this.tableName,
      Item: marshall(dto),
    };

    await this.dynamodbClient.send(new dynamodb.PutItemCommand(tableInsertCmd));
  };

  query = async ({ username }: TranslatePrimaryKey) => {
    const tableQueryCmd: dynamodb.QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "#PARTITION_KEY = :username",
      ExpressionAttributeNames: {
        "#PARTITION_KEY": "username",
      },
      ExpressionAttributeValues: {
        ":username": {
          S: username,
        },
      },
      ScanIndexForward: true,
    };

    const { Items } = await this.dynamodbClient.send(
      new dynamodb.QueryCommand(tableQueryCmd)
    );

    if (!Items) {
      return [];
    }
    return Items.map((item) => {
      return unmarshall(item) as TranslateResult;
    });
  };

  delete = async (item: TranslatePrimaryKey) => {
    const deleteCmd: dynamodb.DeleteItemCommandInput = {
      TableName: this.tableName,
      Key: {
        [this.partitionKey]: {
          S: item.username,
        },
        [this.sortKey]: {
          S: item.requestId,
        },
      },
    };

    await this.dynamodbClient.send(new dynamodb.DeleteItemCommand(deleteCmd));
    return item;
  };

  getAll = async (): Promise<TranslateResult[]> => {
    const scanCmd: dynamodb.ScanCommandInput = {
      TableName: this.tableName,
    };

    const { Items } = await this.dynamodbClient.send(
      new dynamodb.ScanCommand(scanCmd)
    );

    if (!Items) {
      return [];
    }

    const records = Items.map((item) => {
      return unmarshall(item) as TranslateResult;
    });

    return records;
  };
}
