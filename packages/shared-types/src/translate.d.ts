export interface TranslateRequest {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
}

export interface TranslateResponse {
  timestamp: string;
  targetText: string;
}

export type TranslateDbObject = TranslateRequest &
  TranslateResponse & {
    requestId: string;
  };
