export interface TranslateRequest {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
}

export interface TranslateResponse {
  timestamp: string;
  targetText: string;
}

export interface TranslatePrimaryKey {
  username: string;
  requestId: string;
}

export type TranslateResult = TranslateRequest &
  TranslateResponse &
  TranslatePrimaryKey;

export type TranslateResultList = Array<TranslateResult>;
