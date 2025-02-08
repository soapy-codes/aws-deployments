import { TranslateDbObject } from "@a2t/shared-types";
import * as dynamodb from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export class TranslationTable {
  readonly tableName: string;
  readonly partitionKey: string;
  dynamodbClient: dynamodb.DynamoDBClient;
  constructor({
    tableName,
    partitionKey,
  }: {
    tableName: string;
    partitionKey: string;
  }) {
    this.tableName = tableName;
    this.partitionKey = partitionKey;
    this.dynamodbClient = new dynamodb.DynamoDBClient({
      region: "us-east-2",
    });
  }

  insert = async (dto: TranslateDbObject) => {
    const tableInsertCmd: dynamodb.PutItemCommandInput = {
      TableName: this.tableName,
      Item: marshall(dto),
    };

    await this.dynamodbClient.send(new dynamodb.PutItemCommand(tableInsertCmd));
  };

  getAll = async (): Promise<TranslateDbObject[]> => {
    const scanCmd: dynamodb.ScanCommandInput = {
      TableName: this.tableName,
    };

    const { Items } = await this.dynamodbClient.send(
      new dynamodb.ScanCommand(scanCmd)
    );

    if (!Items) {
      console.log("The table is not returning the output we hoped for");
      return [];
    }

    const records = Items.map((item) => {
      return unmarshall(item) as TranslateDbObject;
    });

    return records;
  };
}
