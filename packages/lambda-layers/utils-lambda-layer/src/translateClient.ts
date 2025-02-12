import * as clientTranslate from "@aws-sdk/client-translate";
import { TranslateRequest } from "@a2t/shared-types";
import { MissingProperty } from "./appExceptions";

export async function getTranslation({
  sourceLang,
  targetLang,
  sourceText,
}: TranslateRequest): Promise<string> {
  const translateClient = new clientTranslate.TranslateClient();
  const translateCmd = new clientTranslate.TranslateTextCommand({
    SourceLanguageCode: sourceLang,
    TargetLanguageCode: targetLang,
    Text: sourceText,
  });

  const result = await translateClient.send(translateCmd);

  if (!result.TranslatedText) {
    throw new MissingProperty("TranslatedText");
  }

  return result.TranslatedText;
}
