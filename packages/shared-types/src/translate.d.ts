export interface TranslateRequest {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
}

export interface TranslateResponse {
  timestamp: string;
  targetText: string;
}
