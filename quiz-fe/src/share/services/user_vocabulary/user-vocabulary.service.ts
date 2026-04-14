import { ENV } from "@/share/utils/env";
import { BaseService } from "../BaseService";
import {
  UserVocabulary,
  UserVocabularyRequest,
  UserVocabularyResponse,
  UserVocabularyView,
} from "./models";

export class UserVocabularyService extends BaseService<
  UserVocabulary,
  UserVocabularyRequest,
  UserVocabularyResponse,
  UserVocabularyView
> {
  constructor() {
    super(ENV.API_URL, "user-vocabulary");
  }

  async buildQuestions(userId: number, optionsCount = 4, questionsCount = 10) {
    const url = `${this.getEndpoint()}/review/questions`;
    return this.handleRequest<any[]>(url, {
      method: "POST",
      body: JSON.stringify({ userId, optionsCount, questionsCount }),
    });
  }

  async buildQuestion(userId: number, optionsCount = 4, vocabId?: number) {
    const url = `${this.getEndpoint()}/review/question`;
    return this.handleRequest<any>(url, {
      method: "POST",
      body: JSON.stringify({ userId, optionsCount, vocabId }),
    });
  }

  async reviewVocabulary(
    vocabId: number | string,
    userId: number | undefined,
    quality: number
  , timeSpentMillis?: number) {
    const url = `${this.getEndpoint()}/${vocabId}/review`;
    return this.handleRequest<any>(url, {
      method: "POST",
      body: JSON.stringify({ userId, quality, timeSpentMillis }),
    });
  }

  async saveVocab(payload: { word: string; data?: any }) {
    const url = `${this.getEndpoint()}/save-vocab`;
    return this.handleRequest<any>(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const userVocabularyService = new UserVocabularyService();
