export interface FlashcardCategory {
  id: number;
  userId: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  cardCount?: number;
  isPublic?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface FlashcardCategoryRequest {
  userId?: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isPublic?: boolean;
}

export interface FlashcardCategoryResponse extends FlashcardCategory {}

export interface FlashcardCategoryView extends FlashcardCategory {}

export interface FlashcardItem {
  id: number;
  categoryId: number;
  userId: number;
  frontContent: string;
  backContent: string;
  example?: string;
  frontImage?: string;
  backImage?: string;
  audioUrl?: string;
  tags?: string;
  difficulty?: number;
  reviewCount?: number;
  correctCount?: number;
  lastReviewedAt?: string;
  nextReviewAt?: string;
  sortOrder?: number;
  categoryName?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface FlashcardItemRequest {
  categoryId: number;
  userId?: number;
  frontContent: string;
  backContent: string;
  example?: string;
  frontImage?: string;
  backImage?: string;
  audioUrl?: string;
  tags?: string;
  difficulty?: number;
  sortOrder?: number;
}

export interface FlashcardItemResponse extends FlashcardItem {}

export interface FlashcardItemView extends FlashcardItem {}
