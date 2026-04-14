import { ENV } from "@/share/utils/env";
import { BaseService } from "../BaseService";
import {
  FlashcardCategory,
  FlashcardCategoryRequest,
  FlashcardCategoryResponse,
  FlashcardCategoryView,
  FlashcardItem,
  FlashcardItemRequest,
  FlashcardItemResponse,
  FlashcardItemView,
} from "./models";

export class FlashcardCategoryService extends BaseService<
  FlashcardCategory,
  FlashcardCategoryRequest,
  FlashcardCategoryResponse,
  FlashcardCategoryView
> {
  constructor() {
    super(ENV.API_URL, "flashcard-categories");
  }

  async getMyCategories(): Promise<FlashcardCategoryView[]> {
    return this.handleRequest<FlashcardCategoryView[]>(
      `${this.getEndpoint()}/my-categories`
    );
  }

  async getCategoriesByUser(userId: number): Promise<FlashcardCategoryView[]> {
    return this.handleRequest<FlashcardCategoryView[]>(
      `${this.getEndpoint()}/user/${userId}`
    );
  }
}

export class FlashcardItemService extends BaseService<
  FlashcardItem,
  FlashcardItemRequest,
  FlashcardItemResponse,
  FlashcardItemView
> {
  constructor() {
    super(ENV.API_URL, "flashcard-items");
  }

  async getItemsByCategory(categoryId: number): Promise<FlashcardItemView[]> {
    return this.handleRequest<FlashcardItemView[]>(
      `${this.getEndpoint()}/category/${categoryId}`
    );
  }

  async getMyItems(): Promise<FlashcardItemView[]> {
    return this.handleRequest<FlashcardItemView[]>(
      `${this.getEndpoint()}/my-items`
    );
  }

  async reviewItem(itemId: number, isCorrect: boolean): Promise<any> {
    return this.handleRequest<any>(`${this.getEndpoint()}/${itemId}/review`, {
      method: "POST",
      body: JSON.stringify({ isCorrect }),
    });
  }
}

export const flashcardCategoryService = new FlashcardCategoryService();
export const flashcardItemService = new FlashcardItemService();
